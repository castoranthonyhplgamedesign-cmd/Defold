using System.Collections.Generic;
using UnityEngine;
using NaughtyAttributes;

[CreateAssetMenu(menuName = "Marble Game/Tray Database")]
public class TrayDatabase : ScriptableObject
{
    [System.Serializable]
    public class TrayPrefabEntry
    {
        [Label("Tray Type")]
        public TrayType type;

        public GameObject prefab;
    }

    public List<TrayPrefabEntry> entries;

    private Dictionary<TrayType, GameObject> _lookup;

    public void Initialize()
    {
        _lookup = new Dictionary<TrayType, GameObject>();

        foreach (var entry in entries)
        {
            if (!_lookup.ContainsKey(entry.type))
                _lookup.Add(entry.type, entry.prefab);
        }
    }

    public GameObject GetPrefab(TrayType type)
    {
        if (_lookup == null)
            Initialize();

        if (_lookup.TryGetValue(type, out GameObject prefab))
            return prefab;

        Debug.LogError($"No prefab found for {type}");
        return null;
    }
}
