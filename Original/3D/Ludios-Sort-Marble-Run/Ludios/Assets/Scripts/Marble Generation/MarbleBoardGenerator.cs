#if UNITY_EDITOR
using NaughtyAttributes;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;
using UnityEngine.UI;

[ExecuteInEditMode]
public class MarbleBoardGenerator : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private MarbleLevelData levelData;
    [SerializeField] private MarbleDatabase marbleDatabase;
    [Tooltip("Shared Wrong prompt RectTransform to assign to every spawned marble.")]
    [SerializeField] private RectTransform wrongPromptImage;
    [Tooltip("The Canvas containing wrongPromptImage — assigned to every spawned marble for world→canvas positioning.")]
    [SerializeField] private Canvas wrongPromptCanvas;

    [Header("Spawn Points per Column")]
    [Tooltip("Assign a spawn point transform for each column.")]
    [SerializeField] private List<Transform> columnSpawnPoints = new();

    [Header("Layout")]
    [SerializeField] private float zSpacing = 1f;

    [Button]
    public void GenerateBoard()
    {
        if (levelData == null || marbleDatabase == null)
        {
            Debug.LogError("Missing references!");
            return;
        }

        if (columnSpawnPoints.Count != levelData.columns.Count)
        {
            Debug.LogError("Spawn points count must match the number of columns in level data!");
            return;
        }

        ClearBoard();

        for (int i = 0; i < levelData.columns.Count; i++)
        {
            var columnData = levelData.columns[i];
            var spawnPoint = columnSpawnPoints[i];

            if (spawnPoint == null)
            {
                Debug.LogWarning($"Column {i} has no spawn point assigned.");
                continue;
            }

            GenerateColumn(spawnPoint, columnData);
        }

        // Auto-assign left/right neighbors on each MarbleColumn so out-of-order marbles
        // can route through an adjacent column without manual Inspector wiring.
        for (int i = 0; i < columnSpawnPoints.Count; i++)
        {
            var sp = columnSpawnPoints[i];
            if (sp == null) continue;

            var col = sp.GetComponent<MarbleColumn>();
            if (col == null) continue;

            MarbleColumn left  = (i > 0 && columnSpawnPoints[i - 1] != null)
                                 ? columnSpawnPoints[i - 1].GetComponent<MarbleColumn>() : null;
            MarbleColumn right = (i < columnSpawnPoints.Count - 1 && columnSpawnPoints[i + 1] != null)
                                 ? columnSpawnPoints[i + 1].GetComponent<MarbleColumn>() : null;

            Undo.RecordObject(col, "Set Marble Column Neighbors");
            col.SetNeighbors(left, right);
            EditorUtility.SetDirty(col);
        }
    }

    private void GenerateColumn(Transform parent, MarbleLevelData.ColumnData columnData)
    {
        for (int i = 0; i < columnData.marbles.Count; i++)
        {
            MarbleType type = columnData.marbles[i];
            GameObject prefab = marbleDatabase.GetPrefab(type);

            if (prefab == null)
                continue;

            GameObject marble =
                (GameObject)PrefabUtility.InstantiatePrefab(prefab, parent);

            Undo.RegisterCreatedObjectUndo(marble, "Create Marble");

            // Stack along Z axis under the spawnPoint
            marble.transform.localPosition = new Vector3(0, 0, i * zSpacing);

            // Wire up shared Wrong prompt references
            Marble marbleComponent = marble.GetComponent<Marble>();
            if (marbleComponent != null)
            {
                Undo.RecordObject(marbleComponent, "Assign Wrong Prompt");
                marbleComponent.wrongPromptImage  = wrongPromptImage;
                marbleComponent.wrongPromptCanvas = wrongPromptCanvas;
                EditorUtility.SetDirty(marbleComponent);
            }
        }
    }

    [Button]
    private void ClearBoard()
    {
        foreach (var spawnPoint in columnSpawnPoints)
        {
            if (spawnPoint == null) continue;

            for (int i = spawnPoint.childCount - 1; i >= 0; i--)
            {
                Undo.DestroyObjectImmediate(spawnPoint.GetChild(i).gameObject);
            }
        }
    }
}
#endif
