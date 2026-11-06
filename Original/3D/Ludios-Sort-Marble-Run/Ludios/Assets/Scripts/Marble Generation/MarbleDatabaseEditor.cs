#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

[CustomEditor(typeof(MarbleDatabase))]
public class MarbleDatabaseEditor : Editor
{
    public override void OnInspectorGUI()
    {
        serializedObject.Update();

        SerializedProperty entries = serializedObject.FindProperty("entries");

        for (int i = 0; i < entries.arraySize; i++)
        {
            SerializedProperty element = entries.GetArrayElementAtIndex(i);
            SerializedProperty typeProp = element.FindPropertyRelative("type");
            SerializedProperty prefabProp = element.FindPropertyRelative("prefab");

            EditorGUILayout.BeginVertical("box");

            EditorGUILayout.LabelField(typeProp.enumDisplayNames[typeProp.enumValueIndex],
                EditorStyles.boldLabel);

            EditorGUILayout.PropertyField(typeProp);
            EditorGUILayout.PropertyField(prefabProp);

            EditorGUILayout.EndVertical();
        }

        if (GUILayout.Button("Add Entry"))
        {
            entries.InsertArrayElementAtIndex(entries.arraySize);
        }

        serializedObject.ApplyModifiedProperties();
    }
}
#endif
