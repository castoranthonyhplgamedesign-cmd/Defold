#if UNITY_EDITOR
using NaughtyAttributes;
using System.Collections.Generic;
using UnityEditor;
using UnityEngine;

[ExecuteInEditMode]
public class MarbleIntroGeneration : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private MarbleDatabase marbleDatabase;
    [SerializeField] private MarbleIntroAnimation marbleIntroAnimation;

    [Header("Spawn Points")]
    [Tooltip("Assign spawn point transforms for each row (backmost to front).")]
    [SerializeField] private List<Transform> rowSpawnPoints = new();

    [Header("Layout")]
    [SerializeField] private float xSpacing = 1f;
    [SerializeField] private float zSpacing = 0.5f;

    [Tooltip("Extra gap inserted between Left/Center and Center/Right sections.")]
    [SerializeField] private float sectionGap = 0.3f;

    // Row data: [backmost=13, 3rd=13, 2nd=11, front=9]
    private static readonly int[] MarblesPerRow = { 13, 13, 11, 9 };
    private const int MaxColumns = 15;

    [Button]
    public void GenerateIntro()
    {
        if (marbleDatabase == null)
        {
            Debug.LogError("Missing MarbleDatabase reference!");
            return;
        }

        if (marbleIntroAnimation == null)
        {
            Debug.LogError("Missing MarbleIntroAnimation reference!");
            return;
        }

        if (rowSpawnPoints.Count != 4)
        {
            Debug.LogError("Exactly 4 row spawn points are required!");
            return;
        }

        ClearIntro();

        List<List<Transform>> spawnedMarbles = new();

        for (int rowIndex = 0; rowIndex < rowSpawnPoints.Count; rowIndex++)
        {
            Transform rowParent = rowSpawnPoints[rowIndex];
            if (rowParent == null)
            {
                Debug.LogWarning($"Row {rowIndex} has no spawn point assigned.");
                spawnedMarbles.Add(new List<Transform>());
                continue;
            }

            List<Transform> rowMarbles = GenerateRow(rowParent, MarblesPerRow[rowIndex]);
            spawnedMarbles.Add(rowMarbles);
        }
    }

    private List<Transform> GenerateRow(Transform parent, int marbleCount)
    {
        MarbleType[] allTypes = System.Enum.GetValues(typeof(MarbleType)) as MarbleType[];
        List<Transform> rowMarbles = new();

        int colOffset = (MaxColumns - marbleCount) / 2;

        // Count how many section boundaries this row spans for centering
        float totalGaps = 0f;
        for (int i = 0; i < marbleCount; i++)
        {
            int absCol = i + colOffset;
            if (absCol == 4 || absCol == 11) totalGaps += sectionGap;
        }

        float startX = -((marbleCount - 1) * xSpacing + totalGaps) / 2f;

        float cumulativeGap = 0f;
        for (int i = 0; i < marbleCount; i++)
        {
            int absCol = i + colOffset;
            if (absCol == 4 || absCol == 11) cumulativeGap += sectionGap;

            MarbleType type = allTypes[Random.Range(0, allTypes.Length)];
            GameObject prefab = marbleDatabase.GetPrefab(type);

            if (prefab == null)
                continue;

            GameObject marble = (GameObject)PrefabUtility.InstantiatePrefab(prefab, parent);
            Undo.RegisterCreatedObjectUndo(marble, "Create Intro Marble");

            marble.transform.localPosition = new Vector3(startX + i * xSpacing + cumulativeGap, 0, 0);

            if (marble.TryGetComponent(out Marble marbleScript))
                DestroyImmediate(marbleScript);

            rowMarbles.Add(marble.transform);
        }

        return rowMarbles;
    }

    [Button]
    private void ClearIntro()
    {

        foreach (var rowSpawnPoint in rowSpawnPoints)
        {
            if (rowSpawnPoint == null) continue;

            for (int i = rowSpawnPoint.childCount - 1; i >= 0; i--)
            {
                Undo.DestroyObjectImmediate(rowSpawnPoint.GetChild(i).gameObject);
            }
        }
    }
}
#endif
