using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(menuName = "Marble Game/Level Data")]
public class MarbleLevelData : ScriptableObject
{
    [System.Serializable]
    public class ColumnData
    {
        [Tooltip("Index 0 is bottom, last is top (or however you generate)")]
        public List<MarbleType> marbles = new List<MarbleType>();
    }

    public List<ColumnData> columns = new List<ColumnData>();
}
