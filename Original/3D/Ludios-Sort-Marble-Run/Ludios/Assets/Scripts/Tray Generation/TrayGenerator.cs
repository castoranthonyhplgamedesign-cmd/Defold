#if UNITY_EDITOR
using NaughtyAttributes;
using UnityEditor;
using UnityEngine;

[ExecuteInEditMode]
public class TrayGenerator : MonoBehaviour
{
    [Header("References")]
    [SerializeField] private TrayLevelData levelData;
    [SerializeField] private TrayDatabase trayDatabase;
    [SerializeField] private TrayManager trayManager;

    [Header("Spawn Settings")]
    [Tooltip("Parent transform where trays will be spawned under.")]
    [SerializeField] private Transform spawnParent;

    [Tooltip("Position of the first tray.")]
    [SerializeField] private Transform spawnPoint;

    [Header("Layout")]
    [Tooltip("Offset spacing between each tray.")]
    [SerializeField] private Vector3 offsetSpacing = new Vector3(35f, 0f, 0f);

    [Button]
    public void Generate()
    {
        if (levelData == null || trayDatabase == null)
        {
            Debug.LogError("Missing references!");
            return;
        }

        if (spawnParent == null || spawnPoint == null)
        {
            Debug.LogError("Spawn parent and spawn point must be assigned!");
            return;
        }

        Clear();

        Debug.Log($"Tray Level Data has {levelData.trays.Count} trays to generate.");

        for (int i = 0; i < levelData.trays.Count; i++)
        {
            TrayType type = levelData.trays[i];
            GameObject prefab = trayDatabase.GetPrefab(type);

            if (prefab == null)
                continue;

            GameObject tray =
                (GameObject)PrefabUtility.InstantiatePrefab(prefab, spawnParent);

            Undo.RegisterCreatedObjectUndo(tray, "Create Tray");

            tray.transform.position = spawnPoint.position + (offsetSpacing * i);
        }

        if (trayManager != null)
            trayManager.PopulateTrays(spawnParent);
    }

    [Button]
    public void Clear()
    {
        if (spawnParent == null) return;

        for (int i = spawnParent.childCount - 1; i >= 0; i--)
        {
            Undo.DestroyObjectImmediate(spawnParent.GetChild(i).gameObject);
        }

        if (trayManager != null)
            trayManager.ClearTrays();
    }
}
#endif
