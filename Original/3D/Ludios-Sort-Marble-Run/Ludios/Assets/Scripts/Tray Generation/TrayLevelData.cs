using System.Collections.Generic;
using UnityEngine;

[CreateAssetMenu(menuName = "Marble Game/Tray Level Data")]
public class TrayLevelData : ScriptableObject
{
    [Tooltip("List of tray types to generate in order.")]
    public List<TrayType> trays = new List<TrayType>();
}
