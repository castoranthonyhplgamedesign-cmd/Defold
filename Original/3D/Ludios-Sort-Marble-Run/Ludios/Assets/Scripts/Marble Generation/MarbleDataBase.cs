using System.Collections.Generic;
using UnityEngine;
using NaughtyAttributes;

[CreateAssetMenu(menuName = "Marble Game/Marble Database")]
public class MarbleDatabase : ScriptableObject
{
    [System.Serializable]
    public class MarblePrefabEntry
    {
        [Label("Marble Type")]
        public MarbleType type;

        public GameObject prefab;
    }

    public List<MarblePrefabEntry> entries;

    private Dictionary<MarbleType, GameObject> _lookup;

    public void Initialize()
    {
        _lookup = new Dictionary<MarbleType, GameObject>();

        foreach (var entry in entries)
        {
            if (!_lookup.ContainsKey(entry.type))
                _lookup.Add(entry.type, entry.prefab);
        }
    }

    public GameObject GetPrefab(MarbleType type)
    {
        if (_lookup == null)
            Initialize();

        if (_lookup.TryGetValue(type, out GameObject prefab))
            return prefab;

        Debug.LogError($"No prefab found for {type}");
        return null;
    }
}
