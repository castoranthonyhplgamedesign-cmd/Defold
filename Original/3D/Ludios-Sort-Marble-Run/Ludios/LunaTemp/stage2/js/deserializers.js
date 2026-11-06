var Deserializers = {}
Deserializers["UnityEngine.JointSpring"] = function (request, data, root) {
  var i4102 = root || request.c( 'UnityEngine.JointSpring' )
  var i4103 = data
  i4102.spring = i4103[0]
  i4102.damper = i4103[1]
  i4102.targetPosition = i4103[2]
  return i4102
}

Deserializers["UnityEngine.JointMotor"] = function (request, data, root) {
  var i4104 = root || request.c( 'UnityEngine.JointMotor' )
  var i4105 = data
  i4104.m_TargetVelocity = i4105[0]
  i4104.m_Force = i4105[1]
  i4104.m_FreeSpin = i4105[2]
  return i4104
}

Deserializers["UnityEngine.JointLimits"] = function (request, data, root) {
  var i4106 = root || request.c( 'UnityEngine.JointLimits' )
  var i4107 = data
  i4106.m_Min = i4107[0]
  i4106.m_Max = i4107[1]
  i4106.m_Bounciness = i4107[2]
  i4106.m_BounceMinVelocity = i4107[3]
  i4106.m_ContactDistance = i4107[4]
  i4106.minBounce = i4107[5]
  i4106.maxBounce = i4107[6]
  return i4106
}

Deserializers["UnityEngine.JointDrive"] = function (request, data, root) {
  var i4108 = root || request.c( 'UnityEngine.JointDrive' )
  var i4109 = data
  i4108.m_PositionSpring = i4109[0]
  i4108.m_PositionDamper = i4109[1]
  i4108.m_MaximumForce = i4109[2]
  i4108.m_UseAcceleration = i4109[3]
  return i4108
}

Deserializers["UnityEngine.SoftJointLimitSpring"] = function (request, data, root) {
  var i4110 = root || request.c( 'UnityEngine.SoftJointLimitSpring' )
  var i4111 = data
  i4110.m_Spring = i4111[0]
  i4110.m_Damper = i4111[1]
  return i4110
}

Deserializers["UnityEngine.SoftJointLimit"] = function (request, data, root) {
  var i4112 = root || request.c( 'UnityEngine.SoftJointLimit' )
  var i4113 = data
  i4112.m_Limit = i4113[0]
  i4112.m_Bounciness = i4113[1]
  i4112.m_ContactDistance = i4113[2]
  return i4112
}

Deserializers["UnityEngine.WheelFrictionCurve"] = function (request, data, root) {
  var i4114 = root || request.c( 'UnityEngine.WheelFrictionCurve' )
  var i4115 = data
  i4114.m_ExtremumSlip = i4115[0]
  i4114.m_ExtremumValue = i4115[1]
  i4114.m_AsymptoteSlip = i4115[2]
  i4114.m_AsymptoteValue = i4115[3]
  i4114.m_Stiffness = i4115[4]
  return i4114
}

Deserializers["UnityEngine.JointAngleLimits2D"] = function (request, data, root) {
  var i4116 = root || request.c( 'UnityEngine.JointAngleLimits2D' )
  var i4117 = data
  i4116.m_LowerAngle = i4117[0]
  i4116.m_UpperAngle = i4117[1]
  return i4116
}

Deserializers["UnityEngine.JointMotor2D"] = function (request, data, root) {
  var i4118 = root || request.c( 'UnityEngine.JointMotor2D' )
  var i4119 = data
  i4118.m_MotorSpeed = i4119[0]
  i4118.m_MaximumMotorTorque = i4119[1]
  return i4118
}

Deserializers["UnityEngine.JointSuspension2D"] = function (request, data, root) {
  var i4120 = root || request.c( 'UnityEngine.JointSuspension2D' )
  var i4121 = data
  i4120.m_DampingRatio = i4121[0]
  i4120.m_Frequency = i4121[1]
  i4120.m_Angle = i4121[2]
  return i4120
}

Deserializers["UnityEngine.JointTranslationLimits2D"] = function (request, data, root) {
  var i4122 = root || request.c( 'UnityEngine.JointTranslationLimits2D' )
  var i4123 = data
  i4122.m_LowerTranslation = i4123[0]
  i4122.m_UpperTranslation = i4123[1]
  return i4122
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh"] = function (request, data, root) {
  var i4124 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh' )
  var i4125 = data
  i4124.name = i4125[0]
  i4124.halfPrecision = !!i4125[1]
  i4124.useSimplification = !!i4125[2]
  i4124.useUInt32IndexFormat = !!i4125[3]
  i4124.vertexCount = i4125[4]
  i4124.aabb = i4125[5]
  var i4127 = i4125[6]
  var i4126 = []
  for(var i = 0; i < i4127.length; i += 1) {
    i4126.push( !!i4127[i + 0] );
  }
  i4124.streams = i4126
  i4124.vertices = i4125[7]
  var i4129 = i4125[8]
  var i4128 = []
  for(var i = 0; i < i4129.length; i += 1) {
    i4128.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh', i4129[i + 0]) );
  }
  i4124.subMeshes = i4128
  var i4131 = i4125[9]
  var i4130 = []
  for(var i = 0; i < i4131.length; i += 16) {
    i4130.push( new pc.Mat4().setData(i4131[i + 0], i4131[i + 1], i4131[i + 2], i4131[i + 3],  i4131[i + 4], i4131[i + 5], i4131[i + 6], i4131[i + 7],  i4131[i + 8], i4131[i + 9], i4131[i + 10], i4131[i + 11],  i4131[i + 12], i4131[i + 13], i4131[i + 14], i4131[i + 15]) );
  }
  i4124.bindposes = i4130
  var i4133 = i4125[10]
  var i4132 = []
  for(var i = 0; i < i4133.length; i += 1) {
    i4132.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape', i4133[i + 0]) );
  }
  i4124.blendShapes = i4132
  return i4124
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh"] = function (request, data, root) {
  var i4138 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh' )
  var i4139 = data
  i4138.triangles = i4139[0]
  return i4138
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape"] = function (request, data, root) {
  var i4144 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape' )
  var i4145 = data
  i4144.name = i4145[0]
  var i4147 = i4145[1]
  var i4146 = []
  for(var i = 0; i < i4147.length; i += 1) {
    i4146.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame', i4147[i + 0]) );
  }
  i4144.frames = i4146
  return i4144
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material"] = function (request, data, root) {
  var i4148 = root || new pc.UnityMaterial()
  var i4149 = data
  i4148.name = i4149[0]
  request.r(i4149[1], i4149[2], 0, i4148, 'shader')
  i4148.renderQueue = i4149[3]
  i4148.enableInstancing = !!i4149[4]
  var i4151 = i4149[5]
  var i4150 = []
  for(var i = 0; i < i4151.length; i += 1) {
    i4150.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter', i4151[i + 0]) );
  }
  i4148.floatParameters = i4150
  var i4153 = i4149[6]
  var i4152 = []
  for(var i = 0; i < i4153.length; i += 1) {
    i4152.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter', i4153[i + 0]) );
  }
  i4148.colorParameters = i4152
  var i4155 = i4149[7]
  var i4154 = []
  for(var i = 0; i < i4155.length; i += 1) {
    i4154.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter', i4155[i + 0]) );
  }
  i4148.vectorParameters = i4154
  var i4157 = i4149[8]
  var i4156 = []
  for(var i = 0; i < i4157.length; i += 1) {
    i4156.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter', i4157[i + 0]) );
  }
  i4148.textureParameters = i4156
  var i4159 = i4149[9]
  var i4158 = []
  for(var i = 0; i < i4159.length; i += 1) {
    i4158.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag', i4159[i + 0]) );
  }
  i4148.materialFlags = i4158
  return i4148
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter"] = function (request, data, root) {
  var i4162 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter' )
  var i4163 = data
  i4162.name = i4163[0]
  i4162.value = i4163[1]
  return i4162
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter"] = function (request, data, root) {
  var i4166 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter' )
  var i4167 = data
  i4166.name = i4167[0]
  i4166.value = new pc.Color(i4167[1], i4167[2], i4167[3], i4167[4])
  return i4166
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter"] = function (request, data, root) {
  var i4170 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter' )
  var i4171 = data
  i4170.name = i4171[0]
  i4170.value = new pc.Vec4( i4171[1], i4171[2], i4171[3], i4171[4] )
  return i4170
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter"] = function (request, data, root) {
  var i4174 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter' )
  var i4175 = data
  i4174.name = i4175[0]
  request.r(i4175[1], i4175[2], 0, i4174, 'value')
  return i4174
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag"] = function (request, data, root) {
  var i4178 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag' )
  var i4179 = data
  i4178.name = i4179[0]
  i4178.enabled = !!i4179[1]
  return i4178
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Texture2D"] = function (request, data, root) {
  var i4180 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Texture2D' )
  var i4181 = data
  i4180.name = i4181[0]
  i4180.width = i4181[1]
  i4180.height = i4181[2]
  i4180.mipmapCount = i4181[3]
  i4180.anisoLevel = i4181[4]
  i4180.filterMode = i4181[5]
  i4180.hdr = !!i4181[6]
  i4180.format = i4181[7]
  i4180.wrapMode = i4181[8]
  i4180.alphaIsTransparency = !!i4181[9]
  i4180.alphaSource = i4181[10]
  i4180.graphicsFormat = i4181[11]
  i4180.sRGBTexture = !!i4181[12]
  i4180.desiredColorSpace = i4181[13]
  i4180.wrapU = i4181[14]
  i4180.wrapV = i4181[15]
  return i4180
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Transform"] = function (request, data, root) {
  var i4182 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Transform' )
  var i4183 = data
  i4182.position = new pc.Vec3( i4183[0], i4183[1], i4183[2] )
  i4182.scale = new pc.Vec3( i4183[3], i4183[4], i4183[5] )
  i4182.rotation = new pc.Quat(i4183[6], i4183[7], i4183[8], i4183[9])
  return i4182
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.MeshFilter"] = function (request, data, root) {
  var i4184 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.MeshFilter' )
  var i4185 = data
  request.r(i4185[0], i4185[1], 0, i4184, 'sharedMesh')
  return i4184
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.MeshRenderer"] = function (request, data, root) {
  var i4186 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.MeshRenderer' )
  var i4187 = data
  request.r(i4187[0], i4187[1], 0, i4186, 'additionalVertexStreams')
  i4186.enabled = !!i4187[2]
  request.r(i4187[3], i4187[4], 0, i4186, 'sharedMaterial')
  var i4189 = i4187[5]
  var i4188 = []
  for(var i = 0; i < i4189.length; i += 2) {
  request.r(i4189[i + 0], i4189[i + 1], 2, i4188, '')
  }
  i4186.sharedMaterials = i4188
  i4186.receiveShadows = !!i4187[6]
  i4186.shadowCastingMode = i4187[7]
  i4186.sortingLayerID = i4187[8]
  i4186.sortingOrder = i4187[9]
  i4186.lightmapIndex = i4187[10]
  i4186.lightmapSceneIndex = i4187[11]
  i4186.lightmapScaleOffset = new pc.Vec4( i4187[12], i4187[13], i4187[14], i4187[15] )
  i4186.lightProbeUsage = i4187[16]
  i4186.reflectionProbeUsage = i4187[17]
  return i4186
}

Deserializers["Marble"] = function (request, data, root) {
  var i4192 = root || request.c( 'Marble' )
  var i4193 = data
  i4192.marbleType = i4193[0]
  request.r(i4193[1], i4193[2], 0, i4192, 'wrongPromptImage')
  request.r(i4193[3], i4193[4], 0, i4192, 'wrongPromptCanvas')
  return i4192
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.SphereCollider"] = function (request, data, root) {
  var i4194 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.SphereCollider' )
  var i4195 = data
  i4194.center = new pc.Vec3( i4195[0], i4195[1], i4195[2] )
  i4194.radius = i4195[3]
  i4194.enabled = !!i4195[4]
  i4194.isTrigger = !!i4195[5]
  request.r(i4195[6], i4195[7], 0, i4194, 'material')
  return i4194
}

Deserializers["Luna.Unity.DTO.UnityEngine.Scene.GameObject"] = function (request, data, root) {
  var i4196 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Scene.GameObject' )
  var i4197 = data
  i4196.name = i4197[0]
  i4196.tagId = i4197[1]
  i4196.enabled = !!i4197[2]
  i4196.isStatic = !!i4197[3]
  i4196.layer = i4197[4]
  return i4196
}

Deserializers["Tray"] = function (request, data, root) {
  var i4198 = root || request.c( 'Tray' )
  var i4199 = data
  i4198.trayColor = i4199[0]
  var i4201 = i4199[1]
  var i4200 = []
  for(var i = 0; i < i4201.length; i += 2) {
  request.r(i4201[i + 0], i4201[i + 1], 2, i4200, '')
  }
  i4198.slotPoints = i4200
  request.r(i4199[2], i4199[3], 0, i4198, 'failImage')
  request.r(i4199[4], i4199[5], 0, i4198, 'vignetteImage')
  return i4198
}

Deserializers["TrayAnimation"] = function (request, data, root) {
  var i4204 = root || request.c( 'TrayAnimation' )
  var i4205 = data
  request.r(i4205[0], i4205[1], 0, i4204, 'trayMesh')
  request.r(i4205[2], i4205[3], 0, i4204, 'rampWaypoints')
  i4204.tipDuration = i4205[4]
  i4204.returnDuration = i4205[5]
  i4204.destroyDelay = i4205[6]
  return i4204
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Cubemap"] = function (request, data, root) {
  var i4206 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Cubemap' )
  var i4207 = data
  i4206.name = i4207[0]
  i4206.atlasId = i4207[1]
  i4206.mipmapCount = i4207[2]
  i4206.hdr = !!i4207[3]
  i4206.size = i4207[4]
  i4206.anisoLevel = i4207[5]
  i4206.filterMode = i4207[6]
  var i4209 = i4207[7]
  var i4208 = []
  for(var i = 0; i < i4209.length; i += 4) {
    i4208.push( UnityEngine.Rect.MinMaxRect(i4209[i + 0], i4209[i + 1], i4209[i + 2], i4209[i + 3]) );
  }
  i4206.rects = i4208
  i4206.wrapU = i4207[8]
  i4206.wrapV = i4207[9]
  return i4206
}

Deserializers["Luna.Unity.DTO.UnityEngine.Scene.Scene"] = function (request, data, root) {
  var i4212 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Scene.Scene' )
  var i4213 = data
  i4212.name = i4213[0]
  i4212.index = i4213[1]
  i4212.startup = !!i4213[2]
  return i4212
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Light"] = function (request, data, root) {
  var i4214 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Light' )
  var i4215 = data
  i4214.type = i4215[0]
  i4214.color = new pc.Color(i4215[1], i4215[2], i4215[3], i4215[4])
  i4214.cullingMask = i4215[5]
  i4214.intensity = i4215[6]
  i4214.range = i4215[7]
  i4214.spotAngle = i4215[8]
  i4214.shadows = i4215[9]
  i4214.shadowNormalBias = i4215[10]
  i4214.shadowBias = i4215[11]
  i4214.shadowStrength = i4215[12]
  i4214.shadowResolution = i4215[13]
  i4214.lightmapBakeType = i4215[14]
  i4214.renderMode = i4215[15]
  request.r(i4215[16], i4215[17], 0, i4214, 'cookie')
  i4214.cookieSize = i4215[18]
  i4214.shadowNearPlane = i4215[19]
  i4214.occlusionMaskChannel = i4215[20]
  i4214.isBaked = !!i4215[21]
  i4214.mixedLightingMode = i4215[22]
  i4214.enabled = !!i4215[23]
  return i4214
}

Deserializers["UnityEngine.Rendering.Universal.UniversalAdditionalLightData"] = function (request, data, root) {
  var i4216 = root || request.c( 'UnityEngine.Rendering.Universal.UniversalAdditionalLightData' )
  var i4217 = data
  i4216.m_Version = i4217[0]
  i4216.m_UsePipelineSettings = !!i4217[1]
  i4216.m_AdditionalLightsShadowResolutionTier = i4217[2]
  i4216.m_LightLayerMask = i4217[3]
  i4216.m_RenderingLayers = i4217[4]
  i4216.m_CustomShadowLayers = !!i4217[5]
  i4216.m_ShadowLayerMask = i4217[6]
  i4216.m_ShadowRenderingLayers = i4217[7]
  i4216.m_LightCookieSize = new pc.Vec2( i4217[8], i4217[9] )
  i4216.m_LightCookieOffset = new pc.Vec2( i4217[10], i4217[11] )
  i4216.m_SoftShadowQuality = i4217[12]
  return i4216
}

Deserializers["UnityEngine.Rendering.Volume"] = function (request, data, root) {
  var i4218 = root || request.c( 'UnityEngine.Rendering.Volume' )
  var i4219 = data
  i4218.priority = i4219[0]
  i4218.blendDistance = i4219[1]
  i4218.weight = i4219[2]
  request.r(i4219[3], i4219[4], 0, i4218, 'sharedProfile')
  i4218.m_IsGlobal = !!i4219[5]
  return i4218
}

Deserializers["UnityEngine.EventSystems.EventSystem"] = function (request, data, root) {
  var i4220 = root || request.c( 'UnityEngine.EventSystems.EventSystem' )
  var i4221 = data
  request.r(i4221[0], i4221[1], 0, i4220, 'm_FirstSelected')
  i4220.m_sendNavigationEvents = !!i4221[2]
  i4220.m_DragThreshold = i4221[3]
  return i4220
}

Deserializers["UnityEngine.EventSystems.StandaloneInputModule"] = function (request, data, root) {
  var i4222 = root || request.c( 'UnityEngine.EventSystems.StandaloneInputModule' )
  var i4223 = data
  i4222.m_HorizontalAxis = i4223[0]
  i4222.m_VerticalAxis = i4223[1]
  i4222.m_SubmitButton = i4223[2]
  i4222.m_CancelButton = i4223[3]
  i4222.m_InputActionsPerSecond = i4223[4]
  i4222.m_RepeatDelay = i4223[5]
  i4222.m_ForceModuleActive = !!i4223[6]
  i4222.m_SendPointerHoverToParent = !!i4223[7]
  return i4222
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Camera"] = function (request, data, root) {
  var i4224 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Camera' )
  var i4225 = data
  i4224.aspect = i4225[0]
  i4224.orthographic = !!i4225[1]
  i4224.orthographicSize = i4225[2]
  i4224.backgroundColor = new pc.Color(i4225[3], i4225[4], i4225[5], i4225[6])
  i4224.nearClipPlane = i4225[7]
  i4224.farClipPlane = i4225[8]
  i4224.fieldOfView = i4225[9]
  i4224.depth = i4225[10]
  i4224.clearFlags = i4225[11]
  i4224.cullingMask = i4225[12]
  i4224.rect = i4225[13]
  request.r(i4225[14], i4225[15], 0, i4224, 'targetTexture')
  i4224.usePhysicalProperties = !!i4225[16]
  i4224.focalLength = i4225[17]
  i4224.sensorSize = new pc.Vec2( i4225[18], i4225[19] )
  i4224.lensShift = new pc.Vec2( i4225[20], i4225[21] )
  i4224.gateFit = i4225[22]
  i4224.commandBufferCount = i4225[23]
  i4224.cameraType = i4225[24]
  i4224.enabled = !!i4225[25]
  return i4224
}

Deserializers["UnityEngine.Rendering.Universal.UniversalAdditionalCameraData"] = function (request, data, root) {
  var i4226 = root || request.c( 'UnityEngine.Rendering.Universal.UniversalAdditionalCameraData' )
  var i4227 = data
  i4226.m_RenderShadows = !!i4227[0]
  i4226.m_RequiresDepthTextureOption = i4227[1]
  i4226.m_RequiresOpaqueTextureOption = i4227[2]
  i4226.m_CameraType = i4227[3]
  var i4229 = i4227[4]
  var i4228 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Camera')))
  for(var i = 0; i < i4229.length; i += 2) {
  request.r(i4229[i + 0], i4229[i + 1], 1, i4228, '')
  }
  i4226.m_Cameras = i4228
  i4226.m_RendererIndex = i4227[5]
  i4226.m_VolumeLayerMask = UnityEngine.LayerMask.FromIntegerValue( i4227[6] )
  request.r(i4227[7], i4227[8], 0, i4226, 'm_VolumeTrigger')
  i4226.m_VolumeFrameworkUpdateModeOption = i4227[9]
  i4226.m_RenderPostProcessing = !!i4227[10]
  i4226.m_Antialiasing = i4227[11]
  i4226.m_AntialiasingQuality = i4227[12]
  i4226.m_StopNaN = !!i4227[13]
  i4226.m_Dithering = !!i4227[14]
  i4226.m_ClearDepth = !!i4227[15]
  i4226.m_AllowXRRendering = !!i4227[16]
  i4226.m_AllowHDROutput = !!i4227[17]
  i4226.m_UseScreenCoordOverride = !!i4227[18]
  i4226.m_ScreenSizeOverride = new pc.Vec4( i4227[19], i4227[20], i4227[21], i4227[22] )
  i4226.m_ScreenCoordScaleBias = new pc.Vec4( i4227[23], i4227[24], i4227[25], i4227[26] )
  i4226.m_RequiresDepthTexture = !!i4227[27]
  i4226.m_RequiresColorTexture = !!i4227[28]
  i4226.m_Version = i4227[29]
  i4226.m_TaaSettings = request.d('UnityEngine.Rendering.Universal.TemporalAA+Settings', i4227[30], i4226.m_TaaSettings)
  return i4226
}

Deserializers["UnityEngine.Rendering.Universal.TemporalAA+Settings"] = function (request, data, root) {
  var i4232 = root || request.c( 'UnityEngine.Rendering.Universal.TemporalAA+Settings' )
  var i4233 = data
  i4232.quality = i4233[0]
  i4232.frameInfluence = i4233[1]
  i4232.jitterScale = i4233[2]
  i4232.mipBias = i4233[3]
  i4232.varianceClampScale = i4233[4]
  i4232.contrastAdaptiveSharpening = i4233[5]
  return i4232
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.MeshCollider"] = function (request, data, root) {
  var i4234 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.MeshCollider' )
  var i4235 = data
  request.r(i4235[0], i4235[1], 0, i4234, 'sharedMesh')
  i4234.convex = !!i4235[2]
  i4234.enabled = !!i4235[3]
  i4234.isTrigger = !!i4235[4]
  request.r(i4235[5], i4235[6], 0, i4234, 'material')
  return i4234
}

Deserializers["MarbleBoardGenerator"] = function (request, data, root) {
  var i4236 = root || request.c( 'MarbleBoardGenerator' )
  var i4237 = data
  request.r(i4237[0], i4237[1], 0, i4236, 'levelData')
  request.r(i4237[2], i4237[3], 0, i4236, 'marbleDatabase')
  request.r(i4237[4], i4237[5], 0, i4236, 'wrongPromptImage')
  request.r(i4237[6], i4237[7], 0, i4236, 'wrongPromptCanvas')
  var i4239 = i4237[8]
  var i4238 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Transform')))
  for(var i = 0; i < i4239.length; i += 2) {
  request.r(i4239[i + 0], i4239[i + 1], 1, i4238, '')
  }
  i4236.columnSpawnPoints = i4238
  i4236.zSpacing = i4237[9]
  return i4236
}

Deserializers["TrayGenerator"] = function (request, data, root) {
  var i4242 = root || request.c( 'TrayGenerator' )
  var i4243 = data
  request.r(i4243[0], i4243[1], 0, i4242, 'levelData')
  request.r(i4243[2], i4243[3], 0, i4242, 'trayDatabase')
  request.r(i4243[4], i4243[5], 0, i4242, 'trayManager')
  request.r(i4243[6], i4243[7], 0, i4242, 'spawnParent')
  request.r(i4243[8], i4243[9], 0, i4242, 'spawnPoint')
  i4242.offsetSpacing = new pc.Vec3( i4243[10], i4243[11], i4243[12] )
  return i4242
}

Deserializers["MarbleAnimationManager"] = function (request, data, root) {
  var i4244 = root || request.c( 'MarbleAnimationManager' )
  var i4245 = data
  i4244.marbleRadius = i4245[0]
  i4244.moveSpeed = i4245[1]
  i4244.nudgeForward = i4245[2]
  i4244.maxSwerveBend = i4245[3]
  i4244.fullBendDistance = i4245[4]
  i4244.swerveEndZOffset = i4245[5]
  i4244.swerveArcCorrection = i4245[6]
  i4244.impactBounceHeight = i4245[7]
  i4244.bounceDurationFactor = i4245[8]
  i4244.rampArcCorrection = i4245[9]
  i4244.fallDistance = i4245[10]
  i4244.arcZDistance = i4245[11]
  i4244.fallDuration = i4245[12]
  i4244.arcZEase = i4245[13]
  i4244.arcYEase = i4245[14]
  i4244.fallBounceHeight = i4245[15]
  i4244.fallBounceDurationFactor = i4245[16]
  return i4244
}

Deserializers["TrayManager"] = function (request, data, root) {
  var i4246 = root || request.c( 'TrayManager' )
  var i4247 = data
  var i4249 = i4247[0]
  var i4248 = new (System.Collections.Generic.List$1(Bridge.ns('Tray')))
  for(var i = 0; i < i4249.length; i += 2) {
  request.r(i4249[i + 0], i4249[i + 1], 1, i4248, '')
  }
  i4246.trayCollection = i4248
  request.r(i4247[1], i4247[2], 0, i4246, 'currentTray')
  request.r(i4247[3], i4247[4], 0, i4246, 'trayParent')
  i4246.moveOffset = i4247[5]
  i4246.moveDuration = i4247[6]
  i4246.zSlideDuration = i4247[7]
  i4246.zExitTarget = i4247[8]
  return i4246
}

Deserializers["RampWaypoints"] = function (request, data, root) {
  var i4252 = root || request.c( 'RampWaypoints' )
  var i4253 = data
  var i4255 = i4253[0]
  var i4254 = []
  for(var i = 0; i < i4255.length; i += 2) {
  request.r(i4255[i + 0], i4255[i + 1], 2, i4254, '')
  }
  i4252.leftRailWaypoints = i4254
  var i4257 = i4253[1]
  var i4256 = []
  for(var i = 0; i < i4257.length; i += 2) {
  request.r(i4257[i + 0], i4257[i + 1], 2, i4256, '')
  }
  i4252.rightRailWaypoints = i4256
  return i4252
}

Deserializers["MarbleIntroSpawner"] = function (request, data, root) {
  var i4258 = root || request.c( 'MarbleIntroSpawner' )
  var i4259 = data
  request.r(i4259[0], i4259[1], 0, i4258, 'marbleDatabase')
  request.r(i4259[2], i4259[3], 0, i4258, 'marbleIntroAnimation')
  request.r(i4259[4], i4259[5], 0, i4258, 'marbleParent')
  i4258.batchSize = i4259[6]
  i4258.batchInterval = i4259[7]
  i4258.batchCount = i4259[8]
  i4258.streamSpawnY = i4259[9]
  i4258.neckCentreX = i4259[10]
  i4258.streamSpawnZ = i4259[11]
  i4258.spawnRadius = i4259[12]
  i4258.neckFaceY = i4259[13]
  i4258.neckFallSpeed = i4259[14]
  i4258.neckBottomZ = i4259[15]
  i4258.spreadBeforePeakZ = i4259[16]
  i4258.flareWidth = i4259[17]
  i4258.flareTargetY = i4259[18]
  i4258.flareTargetZ = i4259[19]
  i4258.flarePeakDepth = i4259[20]
  i4258.rollingSpeed = i4259[21]
  i4258.rollingRadius = i4259[22]
  i4258.slotRadius = i4259[23]
  i4258.triangleBottomCount = i4259[24]
  i4258.triangleRowStep = i4259[25]
  i4258.overflowSideExtraX = i4259[26]
  i4258.overflowMiddleCollisionExtraX = i4259[27]
  i4258.overflowFallOvershootZ = i4259[28]
  i4258.newIntro = !!i4259[29]
  i4258.newIntroSpawnMinZ = i4259[30]
  i4258.newIntroSpawnMaxZ = i4259[31]
  i4258.newIntroSpawnMinX = i4259[32]
  i4258.newIntroSpawnMaxX = i4259[33]
  i4258.newIntroSpawnMinY = i4259[34]
  i4258.newIntroSpawnMaxY = i4259[35]
  i4258.newIntroLandY = i4259[36]
  i4258.newIntroMarbleCount = i4259[37]
  i4258.newIntroFallSpeed = i4259[38]
  i4258.newIntroRollDistance = i4259[39]
  i4258.newIntroRollDuration = i4259[40]
  i4258.newIntroSeed = i4259[41]
  i4258.newIntroFallbackRadius = i4259[42]
  i4258.newIntroMaxPlacementAttempts = i4259[43]
  i4258.newIntroBatchSize = i4259[44]
  i4258.newIntroBatchInterval = i4259[45]
  i4258.newIntroCompletionDelay = i4259[46]
  return i4258
}

Deserializers["MarbleIntroAnimation"] = function (request, data, root) {
  var i4260 = root || request.c( 'MarbleIntroAnimation' )
  var i4261 = data
  request.r(i4261[0], i4261[1], 0, i4260, 'introCamera')
  i4260.cameraPanTargetPosition = new pc.Vec3( i4261[2], i4261[3], i4261[4] )
  i4260.cameraPanTargetRotation = new pc.Vec3( i4261[5], i4261[6], i4261[7] )
  i4260.cameraPanDuration = i4261[8]
  i4260.cameraPanDelay = i4261[9]
  i4260.cameraPanEase = i4261[10]
  i4260.cameraPanTargetFOV = i4261[11]
  return i4260
}

Deserializers["CTAManager"] = function (request, data, root) {
  var i4262 = root || request.c( 'CTAManager' )
  var i4263 = data
  i4262.iosLink = i4263[0]
  i4262.androidLink = i4263[1]
  return i4262
}

Deserializers["EndCardManager"] = function (request, data, root) {
  var i4264 = root || request.c( 'EndCardManager' )
  var i4265 = data
  request.r(i4265[0], i4265[1], 0, i4264, 'uiCanvasGroup')
  request.r(i4265[2], i4265[3], 0, i4264, 'bgCanvasGroup')
  request.r(i4265[4], i4265[5], 0, i4264, 'playButtonRect')
  request.r(i4265[6], i4265[7], 0, i4264, 'rotatingRect')
  i4264.fadeDuration = i4265[8]
  i4264.fadeEase = i4265[9]
  i4264.scaleMultiplier = i4265[10]
  i4264.scaleDuration = i4265[11]
  i4264.scaleEase = i4265[12]
  i4264.rotationAmount = i4265[13]
  i4264.rotationDuration = i4265[14]
  i4264.rotationEase = i4265[15]
  var i4267 = i4265[16]
  var i4266 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.GameObject')))
  for(var i = 0; i < i4267.length; i += 2) {
  request.r(i4267[i + 0], i4267[i + 1], 1, i4266, '')
  }
  i4264.turnOff = i4266
  return i4264
}

Deserializers["TutorialManager"] = function (request, data, root) {
  var i4270 = root || request.c( 'TutorialManager' )
  var i4271 = data
  request.r(i4271[0], i4271[1], 0, i4270, 'handRect')
  request.r(i4271[2], i4271[3], 0, i4270, 'handCanvasGroup')
  request.r(i4271[4], i4271[5], 0, i4270, 'overlayCanvas')
  i4270.idleTimeout = i4271[6]
  i4270.fadeDuration = i4271[7]
  i4270.handOffset = new pc.Vec2( i4271[8], i4271[9] )
  i4270.pulseMinScale = i4271[10]
  i4270.pulseMaxScale = i4271[11]
  i4270.pulseDuration = i4271[12]
  return i4270
}

Deserializers["AudioManager"] = function (request, data, root) {
  var i4272 = root || request.c( 'AudioManager' )
  var i4273 = data
  request.r(i4273[0], i4273[1], 0, i4272, 'library')
  i4272.sfxPoolSize = i4273[2]
  return i4272
}

Deserializers["MarbleColumn"] = function (request, data, root) {
  var i4274 = root || request.c( 'MarbleColumn' )
  var i4275 = data
  request.r(i4275[0], i4275[1], 0, i4274, 'leftNeighbor')
  request.r(i4275[2], i4275[3], 0, i4274, 'rightNeighbor')
  return i4274
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.RectTransform"] = function (request, data, root) {
  var i4276 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.RectTransform' )
  var i4277 = data
  i4276.pivot = new pc.Vec2( i4277[0], i4277[1] )
  i4276.anchorMin = new pc.Vec2( i4277[2], i4277[3] )
  i4276.anchorMax = new pc.Vec2( i4277[4], i4277[5] )
  i4276.sizeDelta = new pc.Vec2( i4277[6], i4277[7] )
  i4276.anchoredPosition3D = new pc.Vec3( i4277[8], i4277[9], i4277[10] )
  i4276.rotation = new pc.Quat(i4277[11], i4277[12], i4277[13], i4277[14])
  i4276.scale = new pc.Vec3( i4277[15], i4277[16], i4277[17] )
  return i4276
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Canvas"] = function (request, data, root) {
  var i4278 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Canvas' )
  var i4279 = data
  i4278.planeDistance = i4279[0]
  i4278.referencePixelsPerUnit = i4279[1]
  i4278.isFallbackOverlay = !!i4279[2]
  i4278.renderMode = i4279[3]
  i4278.renderOrder = i4279[4]
  i4278.sortingLayerName = i4279[5]
  i4278.sortingOrder = i4279[6]
  i4278.scaleFactor = i4279[7]
  request.r(i4279[8], i4279[9], 0, i4278, 'worldCamera')
  i4278.overrideSorting = !!i4279[10]
  i4278.pixelPerfect = !!i4279[11]
  i4278.targetDisplay = i4279[12]
  i4278.overridePixelPerfect = !!i4279[13]
  i4278.enabled = !!i4279[14]
  return i4278
}

Deserializers["UnityEngine.UI.CanvasScaler"] = function (request, data, root) {
  var i4280 = root || request.c( 'UnityEngine.UI.CanvasScaler' )
  var i4281 = data
  i4280.m_UiScaleMode = i4281[0]
  i4280.m_ReferencePixelsPerUnit = i4281[1]
  i4280.m_ScaleFactor = i4281[2]
  i4280.m_ReferenceResolution = new pc.Vec2( i4281[3], i4281[4] )
  i4280.m_ScreenMatchMode = i4281[5]
  i4280.m_MatchWidthOrHeight = i4281[6]
  i4280.m_PhysicalUnit = i4281[7]
  i4280.m_FallbackScreenDPI = i4281[8]
  i4280.m_DefaultSpriteDPI = i4281[9]
  i4280.m_DynamicPixelsPerUnit = i4281[10]
  i4280.m_PresetInfoIsWorld = !!i4281[11]
  return i4280
}

Deserializers["UnityEngine.UI.GraphicRaycaster"] = function (request, data, root) {
  var i4282 = root || request.c( 'UnityEngine.UI.GraphicRaycaster' )
  var i4283 = data
  i4282.m_IgnoreReversedGraphics = !!i4283[0]
  i4282.m_BlockingObjects = i4283[1]
  i4282.m_BlockingMask = UnityEngine.LayerMask.FromIntegerValue( i4283[2] )
  return i4282
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer"] = function (request, data, root) {
  var i4284 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer' )
  var i4285 = data
  i4284.cullTransparentMesh = !!i4285[0]
  return i4284
}

Deserializers["UnityEngine.UI.Image"] = function (request, data, root) {
  var i4286 = root || request.c( 'UnityEngine.UI.Image' )
  var i4287 = data
  request.r(i4287[0], i4287[1], 0, i4286, 'm_Sprite')
  i4286.m_Type = i4287[2]
  i4286.m_PreserveAspect = !!i4287[3]
  i4286.m_FillCenter = !!i4287[4]
  i4286.m_FillMethod = i4287[5]
  i4286.m_FillAmount = i4287[6]
  i4286.m_FillClockwise = !!i4287[7]
  i4286.m_FillOrigin = i4287[8]
  i4286.m_UseSpriteMesh = !!i4287[9]
  i4286.m_PixelsPerUnitMultiplier = i4287[10]
  request.r(i4287[11], i4287[12], 0, i4286, 'm_Material')
  i4286.m_Maskable = !!i4287[13]
  i4286.m_Color = new pc.Color(i4287[14], i4287[15], i4287[16], i4287[17])
  i4286.m_RaycastTarget = !!i4287[18]
  i4286.m_RaycastPadding = new pc.Vec4( i4287[19], i4287[20], i4287[21], i4287[22] )
  return i4286
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.CanvasGroup"] = function (request, data, root) {
  var i4288 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.CanvasGroup' )
  var i4289 = data
  i4288.m_Alpha = i4289[0]
  i4288.m_Interactable = !!i4289[1]
  i4288.m_BlocksRaycasts = !!i4289[2]
  i4288.m_IgnoreParentGroups = !!i4289[3]
  i4288.enabled = !!i4289[4]
  return i4288
}

Deserializers["UnityEngine.UI.Button"] = function (request, data, root) {
  var i4290 = root || request.c( 'UnityEngine.UI.Button' )
  var i4291 = data
  i4290.m_OnClick = request.d('UnityEngine.UI.Button+ButtonClickedEvent', i4291[0], i4290.m_OnClick)
  i4290.m_Navigation = request.d('UnityEngine.UI.Navigation', i4291[1], i4290.m_Navigation)
  i4290.m_Transition = i4291[2]
  i4290.m_Colors = request.d('UnityEngine.UI.ColorBlock', i4291[3], i4290.m_Colors)
  i4290.m_SpriteState = request.d('UnityEngine.UI.SpriteState', i4291[4], i4290.m_SpriteState)
  i4290.m_AnimationTriggers = request.d('UnityEngine.UI.AnimationTriggers', i4291[5], i4290.m_AnimationTriggers)
  i4290.m_Interactable = !!i4291[6]
  request.r(i4291[7], i4291[8], 0, i4290, 'm_TargetGraphic')
  return i4290
}

Deserializers["UnityEngine.UI.Button+ButtonClickedEvent"] = function (request, data, root) {
  var i4292 = root || request.c( 'UnityEngine.UI.Button+ButtonClickedEvent' )
  var i4293 = data
  i4292.m_PersistentCalls = request.d('UnityEngine.Events.PersistentCallGroup', i4293[0], i4292.m_PersistentCalls)
  return i4292
}

Deserializers["UnityEngine.Events.PersistentCallGroup"] = function (request, data, root) {
  var i4294 = root || request.c( 'UnityEngine.Events.PersistentCallGroup' )
  var i4295 = data
  var i4297 = i4295[0]
  var i4296 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Events.PersistentCall')))
  for(var i = 0; i < i4297.length; i += 1) {
    i4296.add(request.d('UnityEngine.Events.PersistentCall', i4297[i + 0]));
  }
  i4294.m_Calls = i4296
  return i4294
}

Deserializers["UnityEngine.Events.PersistentCall"] = function (request, data, root) {
  var i4300 = root || request.c( 'UnityEngine.Events.PersistentCall' )
  var i4301 = data
  request.r(i4301[0], i4301[1], 0, i4300, 'm_Target')
  i4300.m_TargetAssemblyTypeName = i4301[2]
  i4300.m_MethodName = i4301[3]
  i4300.m_Mode = i4301[4]
  i4300.m_Arguments = request.d('UnityEngine.Events.ArgumentCache', i4301[5], i4300.m_Arguments)
  i4300.m_CallState = i4301[6]
  return i4300
}

Deserializers["UnityEngine.Events.ArgumentCache"] = function (request, data, root) {
  var i4302 = root || request.c( 'UnityEngine.Events.ArgumentCache' )
  var i4303 = data
  request.r(i4303[0], i4303[1], 0, i4302, 'm_ObjectArgument')
  i4302.m_ObjectArgumentAssemblyTypeName = i4303[2]
  i4302.m_IntArgument = i4303[3]
  i4302.m_FloatArgument = i4303[4]
  i4302.m_StringArgument = i4303[5]
  i4302.m_BoolArgument = !!i4303[6]
  return i4302
}

Deserializers["UnityEngine.UI.Navigation"] = function (request, data, root) {
  var i4304 = root || request.c( 'UnityEngine.UI.Navigation' )
  var i4305 = data
  i4304.m_Mode = i4305[0]
  i4304.m_WrapAround = !!i4305[1]
  request.r(i4305[2], i4305[3], 0, i4304, 'm_SelectOnUp')
  request.r(i4305[4], i4305[5], 0, i4304, 'm_SelectOnDown')
  request.r(i4305[6], i4305[7], 0, i4304, 'm_SelectOnLeft')
  request.r(i4305[8], i4305[9], 0, i4304, 'm_SelectOnRight')
  return i4304
}

Deserializers["UnityEngine.UI.ColorBlock"] = function (request, data, root) {
  var i4306 = root || request.c( 'UnityEngine.UI.ColorBlock' )
  var i4307 = data
  i4306.m_NormalColor = new pc.Color(i4307[0], i4307[1], i4307[2], i4307[3])
  i4306.m_HighlightedColor = new pc.Color(i4307[4], i4307[5], i4307[6], i4307[7])
  i4306.m_PressedColor = new pc.Color(i4307[8], i4307[9], i4307[10], i4307[11])
  i4306.m_SelectedColor = new pc.Color(i4307[12], i4307[13], i4307[14], i4307[15])
  i4306.m_DisabledColor = new pc.Color(i4307[16], i4307[17], i4307[18], i4307[19])
  i4306.m_ColorMultiplier = i4307[20]
  i4306.m_FadeDuration = i4307[21]
  return i4306
}

Deserializers["UnityEngine.UI.SpriteState"] = function (request, data, root) {
  var i4308 = root || request.c( 'UnityEngine.UI.SpriteState' )
  var i4309 = data
  request.r(i4309[0], i4309[1], 0, i4308, 'm_HighlightedSprite')
  request.r(i4309[2], i4309[3], 0, i4308, 'm_PressedSprite')
  request.r(i4309[4], i4309[5], 0, i4308, 'm_SelectedSprite')
  request.r(i4309[6], i4309[7], 0, i4308, 'm_DisabledSprite')
  return i4308
}

Deserializers["UnityEngine.UI.AnimationTriggers"] = function (request, data, root) {
  var i4310 = root || request.c( 'UnityEngine.UI.AnimationTriggers' )
  var i4311 = data
  i4310.m_NormalTrigger = i4311[0]
  i4310.m_HighlightedTrigger = i4311[1]
  i4310.m_PressedTrigger = i4311[2]
  i4310.m_SelectedTrigger = i4311[3]
  i4310.m_DisabledTrigger = i4311[4]
  return i4310
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings"] = function (request, data, root) {
  var i4312 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderSettings' )
  var i4313 = data
  i4312.ambientIntensity = i4313[0]
  i4312.reflectionIntensity = i4313[1]
  i4312.ambientMode = i4313[2]
  i4312.ambientLight = new pc.Color(i4313[3], i4313[4], i4313[5], i4313[6])
  i4312.ambientSkyColor = new pc.Color(i4313[7], i4313[8], i4313[9], i4313[10])
  i4312.ambientGroundColor = new pc.Color(i4313[11], i4313[12], i4313[13], i4313[14])
  i4312.ambientEquatorColor = new pc.Color(i4313[15], i4313[16], i4313[17], i4313[18])
  i4312.fogColor = new pc.Color(i4313[19], i4313[20], i4313[21], i4313[22])
  i4312.fogEndDistance = i4313[23]
  i4312.fogStartDistance = i4313[24]
  i4312.fogDensity = i4313[25]
  i4312.fog = !!i4313[26]
  request.r(i4313[27], i4313[28], 0, i4312, 'skybox')
  i4312.fogMode = i4313[29]
  var i4315 = i4313[30]
  var i4314 = []
  for(var i = 0; i < i4315.length; i += 1) {
    i4314.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap', i4315[i + 0]) );
  }
  i4312.lightmaps = i4314
  i4312.lightProbes = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes', i4313[31], i4312.lightProbes)
  i4312.lightmapsMode = i4313[32]
  i4312.mixedBakeMode = i4313[33]
  i4312.environmentLightingMode = i4313[34]
  i4312.ambientProbe = new pc.SphericalHarmonicsL2(i4313[35])
  request.r(i4313[36], i4313[37], 0, i4312, 'customReflection')
  request.r(i4313[38], i4313[39], 0, i4312, 'defaultReflection')
  i4312.defaultReflectionMode = i4313[40]
  i4312.defaultReflectionResolution = i4313[41]
  i4312.sunLightObjectId = i4313[42]
  i4312.pixelLightCount = i4313[43]
  i4312.defaultReflectionHDR = !!i4313[44]
  i4312.hasLightDataAsset = !!i4313[45]
  i4312.hasManualGenerate = !!i4313[46]
  return i4312
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap"] = function (request, data, root) {
  var i4318 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap' )
  var i4319 = data
  request.r(i4319[0], i4319[1], 0, i4318, 'lightmapColor')
  request.r(i4319[2], i4319[3], 0, i4318, 'lightmapDirection')
  request.r(i4319[4], i4319[5], 0, i4318, 'shadowMask')
  return i4318
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes"] = function (request, data, root) {
  var i4320 = root || new UnityEngine.LightProbes()
  var i4321 = data
  return i4320
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.UniversalRenderPipelineAsset"] = function (request, data, root) {
  var i4328 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.UniversalRenderPipelineAsset' )
  var i4329 = data
  i4328.AdditionalLightsRenderingMode = i4329[0]
  i4328.LightRenderingMode = request.d('Luna.Unity.DTO.UnityEngine.Assets.LightRenderingMode', i4329[1], i4328.LightRenderingMode)
  i4328.MainLightRenderingModeValue = i4329[2]
  i4328.SupportsMainLightShadows = !!i4329[3]
  i4328.MixedLightingSupported = !!i4329[4]
  i4328.MainLightShadowmapResolutionValue = i4329[5]
  i4328.SupportsSoftShadows = !!i4329[6]
  i4328.SoftShadowQualityValue = i4329[7]
  i4328.ShadowDistance = i4329[8]
  i4328.ShadowCascadeCount = i4329[9]
  i4328.Cascade2Split = i4329[10]
  i4328.Cascade3Split = new pc.Vec2( i4329[11], i4329[12] )
  i4328.Cascade4Split = new pc.Vec3( i4329[13], i4329[14], i4329[15] )
  i4328.CascadeBorder = i4329[16]
  i4328.ShadowDepthBias = i4329[17]
  i4328.ShadowNormalBias = i4329[18]
  i4328.RequireDepthTexture = !!i4329[19]
  i4328.RequireOpaqueTexture = !!i4329[20]
  i4328.scriptableRendererData = request.d('Luna.Unity.DTO.UnityEngine.Assets.ScriptableRendererData', i4329[21], i4328.scriptableRendererData)
  return i4328
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.LightRenderingMode"] = function (request, data, root) {
  var i4330 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.LightRenderingMode' )
  var i4331 = data
  i4330.Disabled = i4331[0]
  i4330.PerVertex = i4331[1]
  i4330.PerPixel = i4331[2]
  return i4330
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ScriptableRendererData"] = function (request, data, root) {
  var i4332 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ScriptableRendererData' )
  var i4333 = data
  i4332.opaqueLayerMask = i4333[0]
  i4332.transparentLayerMask = i4333[1]
  var i4335 = i4333[2]
  var i4334 = []
  for(var i = 0; i < i4335.length; i += 1) {
    i4334.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderObjects', i4335[i + 0]) );
  }
  i4332.RenderObjectsFeatures = i4334
  i4332.name = i4333[3]
  return i4332
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderObjects"] = function (request, data, root) {
  var i4338 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderObjects' )
  var i4339 = data
  i4338.settings = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+RenderObjectsSettings', i4339[0], i4338.settings)
  i4338.name = i4339[1]
  i4338.typeName = i4339[2]
  return i4338
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader"] = function (request, data, root) {
  var i4340 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader' )
  var i4341 = data
  var i4343 = i4341[0]
  var i4342 = new (System.Collections.Generic.List$1(Bridge.ns('Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError')))
  for(var i = 0; i < i4343.length; i += 1) {
    i4342.add(request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError', i4343[i + 0]));
  }
  i4340.ShaderCompilationErrors = i4342
  i4340.name = i4341[1]
  i4340.guid = i4341[2]
  var i4345 = i4341[3]
  var i4344 = []
  for(var i = 0; i < i4345.length; i += 1) {
    i4344.push( i4345[i + 0] );
  }
  i4340.shaderDefinedKeywords = i4344
  var i4347 = i4341[4]
  var i4346 = []
  for(var i = 0; i < i4347.length; i += 1) {
    i4346.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass', i4347[i + 0]) );
  }
  i4340.passes = i4346
  var i4349 = i4341[5]
  var i4348 = []
  for(var i = 0; i < i4349.length; i += 1) {
    i4348.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass', i4349[i + 0]) );
  }
  i4340.usePasses = i4348
  var i4351 = i4341[6]
  var i4350 = []
  for(var i = 0; i < i4351.length; i += 1) {
    i4350.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue', i4351[i + 0]) );
  }
  i4340.defaultParameterValues = i4350
  request.r(i4341[7], i4341[8], 0, i4340, 'unityFallbackShader')
  i4340.readDepth = !!i4341[9]
  i4340.hasDepthOnlyPass = !!i4341[10]
  i4340.isCreatedByShaderGraph = !!i4341[11]
  i4340.disableBatching = !!i4341[12]
  i4340.compiled = !!i4341[13]
  return i4340
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError"] = function (request, data, root) {
  var i4354 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError' )
  var i4355 = data
  i4354.shaderName = i4355[0]
  i4354.errorMessage = i4355[1]
  return i4354
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass"] = function (request, data, root) {
  var i4360 = root || new pc.UnityShaderPass()
  var i4361 = data
  i4360.id = i4361[0]
  i4360.subShaderIndex = i4361[1]
  i4360.name = i4361[2]
  i4360.passType = i4361[3]
  i4360.grabPassTextureName = i4361[4]
  i4360.usePass = !!i4361[5]
  i4360.zTest = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[6], i4360.zTest)
  i4360.zWrite = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[7], i4360.zWrite)
  i4360.culling = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[8], i4360.culling)
  i4360.blending = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending', i4361[9], i4360.blending)
  i4360.alphaBlending = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending', i4361[10], i4360.alphaBlending)
  i4360.colorWriteMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[11], i4360.colorWriteMask)
  i4360.offsetUnits = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[12], i4360.offsetUnits)
  i4360.offsetFactor = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[13], i4360.offsetFactor)
  i4360.stencilRef = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[14], i4360.stencilRef)
  i4360.stencilReadMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[15], i4360.stencilReadMask)
  i4360.stencilWriteMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4361[16], i4360.stencilWriteMask)
  i4360.stencilOp = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i4361[17], i4360.stencilOp)
  i4360.stencilOpFront = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i4361[18], i4360.stencilOpFront)
  i4360.stencilOpBack = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i4361[19], i4360.stencilOpBack)
  var i4363 = i4361[20]
  var i4362 = []
  for(var i = 0; i < i4363.length; i += 1) {
    i4362.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag', i4363[i + 0]) );
  }
  i4360.tags = i4362
  var i4365 = i4361[21]
  var i4364 = []
  for(var i = 0; i < i4365.length; i += 1) {
    i4364.push( i4365[i + 0] );
  }
  i4360.passDefinedKeywords = i4364
  var i4367 = i4361[22]
  var i4366 = []
  for(var i = 0; i < i4367.length; i += 1) {
    i4366.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup', i4367[i + 0]) );
  }
  i4360.passDefinedKeywordGroups = i4366
  var i4369 = i4361[23]
  var i4368 = []
  for(var i = 0; i < i4369.length; i += 1) {
    i4368.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant', i4369[i + 0]) );
  }
  i4360.variants = i4368
  var i4371 = i4361[24]
  var i4370 = []
  for(var i = 0; i < i4371.length; i += 1) {
    i4370.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant', i4371[i + 0]) );
  }
  i4360.excludedVariants = i4370
  i4360.hasDepthReader = !!i4361[25]
  return i4360
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value"] = function (request, data, root) {
  var i4372 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value' )
  var i4373 = data
  i4372.val = i4373[0]
  i4372.name = i4373[1]
  return i4372
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending"] = function (request, data, root) {
  var i4374 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending' )
  var i4375 = data
  i4374.src = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4375[0], i4374.src)
  i4374.dst = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4375[1], i4374.dst)
  i4374.op = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4375[2], i4374.op)
  return i4374
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp"] = function (request, data, root) {
  var i4376 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp' )
  var i4377 = data
  i4376.pass = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4377[0], i4376.pass)
  i4376.fail = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4377[1], i4376.fail)
  i4376.zFail = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4377[2], i4376.zFail)
  i4376.comp = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i4377[3], i4376.comp)
  return i4376
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag"] = function (request, data, root) {
  var i4380 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag' )
  var i4381 = data
  i4380.name = i4381[0]
  i4380.value = i4381[1]
  return i4380
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup"] = function (request, data, root) {
  var i4384 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup' )
  var i4385 = data
  var i4387 = i4385[0]
  var i4386 = []
  for(var i = 0; i < i4387.length; i += 1) {
    i4386.push( i4387[i + 0] );
  }
  i4384.keywords = i4386
  i4384.hasDiscard = !!i4385[1]
  return i4384
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant"] = function (request, data, root) {
  var i4390 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant' )
  var i4391 = data
  i4390.passId = i4391[0]
  i4390.subShaderIndex = i4391[1]
  var i4393 = i4391[2]
  var i4392 = []
  for(var i = 0; i < i4393.length; i += 1) {
    i4392.push( i4393[i + 0] );
  }
  i4390.keywords = i4392
  i4390.vertexProgram = i4391[3]
  i4390.fragmentProgram = i4391[4]
  i4390.exportedForWebGl2 = !!i4391[5]
  i4390.readDepth = !!i4391[6]
  return i4390
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass"] = function (request, data, root) {
  var i4396 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass' )
  var i4397 = data
  request.r(i4397[0], i4397[1], 0, i4396, 'shader')
  i4396.pass = i4397[2]
  return i4396
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue"] = function (request, data, root) {
  var i4400 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue' )
  var i4401 = data
  i4400.name = i4401[0]
  i4400.type = i4401[1]
  i4400.value = new pc.Vec4( i4401[2], i4401[3], i4401[4], i4401[5] )
  i4400.textureValue = i4401[6]
  i4400.shaderPropertyFlag = i4401[7]
  return i4400
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Sprite"] = function (request, data, root) {
  var i4402 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Sprite' )
  var i4403 = data
  i4402.name = i4403[0]
  request.r(i4403[1], i4403[2], 0, i4402, 'texture')
  i4402.aabb = i4403[3]
  i4402.vertices = i4403[4]
  i4402.triangles = i4403[5]
  i4402.textureRect = UnityEngine.Rect.MinMaxRect(i4403[6], i4403[7], i4403[8], i4403[9])
  i4402.packedRect = UnityEngine.Rect.MinMaxRect(i4403[10], i4403[11], i4403[12], i4403[13])
  i4402.border = new pc.Vec4( i4403[14], i4403[15], i4403[16], i4403[17] )
  i4402.transparency = i4403[18]
  i4402.bounds = i4403[19]
  i4402.pixelsPerUnit = i4403[20]
  i4402.textureWidth = i4403[21]
  i4402.textureHeight = i4403[22]
  i4402.nativeSize = new pc.Vec2( i4403[23], i4403[24] )
  i4402.pivot = new pc.Vec2( i4403[25], i4403[26] )
  i4402.textureRectOffset = new pc.Vec2( i4403[27], i4403[28] )
  return i4402
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.AudioClip"] = function (request, data, root) {
  var i4404 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.AudioClip' )
  var i4405 = data
  i4404.name = i4405[0]
  return i4404
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Font"] = function (request, data, root) {
  var i4406 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Font' )
  var i4407 = data
  i4406.name = i4407[0]
  i4406.ascent = i4407[1]
  i4406.originalLineHeight = i4407[2]
  i4406.fontSize = i4407[3]
  var i4409 = i4407[4]
  var i4408 = []
  for(var i = 0; i < i4409.length; i += 1) {
    i4408.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo', i4409[i + 0]) );
  }
  i4406.characterInfo = i4408
  request.r(i4407[5], i4407[6], 0, i4406, 'texture')
  i4406.originalFontSize = i4407[7]
  return i4406
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo"] = function (request, data, root) {
  var i4412 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo' )
  var i4413 = data
  i4412.index = i4413[0]
  i4412.advance = i4413[1]
  i4412.bearing = i4413[2]
  i4412.glyphWidth = i4413[3]
  i4412.glyphHeight = i4413[4]
  i4412.minX = i4413[5]
  i4412.maxX = i4413[6]
  i4412.minY = i4413[7]
  i4412.maxY = i4413[8]
  i4412.uvBottomLeftX = i4413[9]
  i4412.uvBottomLeftY = i4413[10]
  i4412.uvBottomRightX = i4413[11]
  i4412.uvBottomRightY = i4413[12]
  i4412.uvTopLeftX = i4413[13]
  i4412.uvTopLeftY = i4413[14]
  i4412.uvTopRightX = i4413[15]
  i4412.uvTopRightY = i4413[16]
  return i4412
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.TextAsset"] = function (request, data, root) {
  var i4414 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.TextAsset' )
  var i4415 = data
  i4414.name = i4415[0]
  i4414.bytes64 = i4415[1]
  i4414.data = i4415[2]
  return i4414
}

Deserializers["UnityEngine.Rendering.VolumeProfile"] = function (request, data, root) {
  var i4416 = root || request.c( 'UnityEngine.Rendering.VolumeProfile' )
  var i4417 = data
  var i4419 = i4417[0]
  var i4418 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Rendering.VolumeComponent')))
  for(var i = 0; i < i4419.length; i += 2) {
  request.r(i4419[i + 0], i4419[i + 1], 1, i4418, '')
  }
  i4416.components = i4418
  return i4416
}

Deserializers["UnityEngine.Rendering.Universal.Tonemapping"] = function (request, data, root) {
  var i4422 = root || request.c( 'UnityEngine.Rendering.Universal.Tonemapping' )
  var i4423 = data
  i4422.mode = request.d('UnityEngine.Rendering.Universal.TonemappingModeParameter', i4423[0], i4422.mode)
  i4422.neutralHDRRangeReductionMode = request.d('UnityEngine.Rendering.Universal.NeutralRangeReductionModeParameter', i4423[1], i4422.neutralHDRRangeReductionMode)
  i4422.acesPreset = request.d('UnityEngine.Rendering.Universal.HDRACESPresetParameter', i4423[2], i4422.acesPreset)
  i4422.hueShiftAmount = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4423[3], i4422.hueShiftAmount)
  i4422.detectPaperWhite = request.d('UnityEngine.Rendering.BoolParameter', i4423[4], i4422.detectPaperWhite)
  i4422.paperWhite = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4423[5], i4422.paperWhite)
  i4422.detectBrightnessLimits = request.d('UnityEngine.Rendering.BoolParameter', i4423[6], i4422.detectBrightnessLimits)
  i4422.minNits = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4423[7], i4422.minNits)
  i4422.maxNits = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4423[8], i4422.maxNits)
  i4422.active = !!i4423[9]
  return i4422
}

Deserializers["UnityEngine.Rendering.Universal.TonemappingModeParameter"] = function (request, data, root) {
  var i4424 = root || request.c( 'UnityEngine.Rendering.Universal.TonemappingModeParameter' )
  var i4425 = data
  i4424.m_Value = i4425[0]
  i4424.m_OverrideState = !!i4425[1]
  return i4424
}

Deserializers["UnityEngine.Rendering.Universal.NeutralRangeReductionModeParameter"] = function (request, data, root) {
  var i4426 = root || request.c( 'UnityEngine.Rendering.Universal.NeutralRangeReductionModeParameter' )
  var i4427 = data
  i4426.m_Value = i4427[0]
  i4426.m_OverrideState = !!i4427[1]
  return i4426
}

Deserializers["UnityEngine.Rendering.Universal.HDRACESPresetParameter"] = function (request, data, root) {
  var i4428 = root || request.c( 'UnityEngine.Rendering.Universal.HDRACESPresetParameter' )
  var i4429 = data
  i4428.m_Value = i4429[0]
  i4428.m_OverrideState = !!i4429[1]
  return i4428
}

Deserializers["UnityEngine.Rendering.ClampedFloatParameter"] = function (request, data, root) {
  var i4430 = root || request.c( 'UnityEngine.Rendering.ClampedFloatParameter' )
  var i4431 = data
  i4430.m_Value = i4431[0]
  i4430.m_OverrideState = !!i4431[1]
  return i4430
}

Deserializers["UnityEngine.Rendering.BoolParameter"] = function (request, data, root) {
  var i4432 = root || request.c( 'UnityEngine.Rendering.BoolParameter' )
  var i4433 = data
  i4432.m_Value = !!i4433[0]
  i4432.m_OverrideState = !!i4433[1]
  return i4432
}

Deserializers["UnityEngine.Rendering.Universal.Bloom"] = function (request, data, root) {
  var i4434 = root || request.c( 'UnityEngine.Rendering.Universal.Bloom' )
  var i4435 = data
  i4434.skipIterations = request.d('UnityEngine.Rendering.ClampedIntParameter', i4435[0], i4434.skipIterations)
  i4434.threshold = request.d('UnityEngine.Rendering.MinFloatParameter', i4435[1], i4434.threshold)
  i4434.intensity = request.d('UnityEngine.Rendering.MinFloatParameter', i4435[2], i4434.intensity)
  i4434.scatter = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4435[3], i4434.scatter)
  i4434.clamp = request.d('UnityEngine.Rendering.MinFloatParameter', i4435[4], i4434.clamp)
  i4434.tint = request.d('UnityEngine.Rendering.ColorParameter', i4435[5], i4434.tint)
  i4434.highQualityFiltering = request.d('UnityEngine.Rendering.BoolParameter', i4435[6], i4434.highQualityFiltering)
  i4434.downscale = request.d('UnityEngine.Rendering.Universal.DownscaleParameter', i4435[7], i4434.downscale)
  i4434.maxIterations = request.d('UnityEngine.Rendering.ClampedIntParameter', i4435[8], i4434.maxIterations)
  i4434.dirtTexture = request.d('UnityEngine.Rendering.TextureParameter', i4435[9], i4434.dirtTexture)
  i4434.dirtIntensity = request.d('UnityEngine.Rendering.MinFloatParameter', i4435[10], i4434.dirtIntensity)
  i4434.active = !!i4435[11]
  return i4434
}

Deserializers["UnityEngine.Rendering.ClampedIntParameter"] = function (request, data, root) {
  var i4436 = root || request.c( 'UnityEngine.Rendering.ClampedIntParameter' )
  var i4437 = data
  i4436.m_Value = i4437[0]
  i4436.m_OverrideState = !!i4437[1]
  return i4436
}

Deserializers["UnityEngine.Rendering.MinFloatParameter"] = function (request, data, root) {
  var i4438 = root || request.c( 'UnityEngine.Rendering.MinFloatParameter' )
  var i4439 = data
  i4438.m_Value = i4439[0]
  i4438.m_OverrideState = !!i4439[1]
  return i4438
}

Deserializers["UnityEngine.Rendering.ColorParameter"] = function (request, data, root) {
  var i4440 = root || request.c( 'UnityEngine.Rendering.ColorParameter' )
  var i4441 = data
  i4440.m_Value = new pc.Color(i4441[0], i4441[1], i4441[2], i4441[3])
  i4440.m_OverrideState = !!i4441[4]
  return i4440
}

Deserializers["UnityEngine.Rendering.Universal.DownscaleParameter"] = function (request, data, root) {
  var i4442 = root || request.c( 'UnityEngine.Rendering.Universal.DownscaleParameter' )
  var i4443 = data
  i4442.m_Value = i4443[0]
  i4442.m_OverrideState = !!i4443[1]
  return i4442
}

Deserializers["UnityEngine.Rendering.TextureParameter"] = function (request, data, root) {
  var i4444 = root || request.c( 'UnityEngine.Rendering.TextureParameter' )
  var i4445 = data
  i4444.dimension = i4445[0]
  request.r(i4445[1], i4445[2], 0, i4444, 'm_Value')
  i4444.m_OverrideState = !!i4445[3]
  return i4444
}

Deserializers["UnityEngine.Rendering.Universal.MotionBlur"] = function (request, data, root) {
  var i4446 = root || request.c( 'UnityEngine.Rendering.Universal.MotionBlur' )
  var i4447 = data
  i4446.mode = request.d('UnityEngine.Rendering.Universal.MotionBlurModeParameter', i4447[0], i4446.mode)
  i4446.quality = request.d('UnityEngine.Rendering.Universal.MotionBlurQualityParameter', i4447[1], i4446.quality)
  i4446.intensity = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4447[2], i4446.intensity)
  i4446.clamp = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4447[3], i4446.clamp)
  i4446.active = !!i4447[4]
  return i4446
}

Deserializers["UnityEngine.Rendering.Universal.MotionBlurModeParameter"] = function (request, data, root) {
  var i4448 = root || request.c( 'UnityEngine.Rendering.Universal.MotionBlurModeParameter' )
  var i4449 = data
  i4448.m_Value = i4449[0]
  i4448.m_OverrideState = !!i4449[1]
  return i4448
}

Deserializers["UnityEngine.Rendering.Universal.MotionBlurQualityParameter"] = function (request, data, root) {
  var i4450 = root || request.c( 'UnityEngine.Rendering.Universal.MotionBlurQualityParameter' )
  var i4451 = data
  i4450.m_Value = i4451[0]
  i4450.m_OverrideState = !!i4451[1]
  return i4450
}

Deserializers["UnityEngine.Rendering.Universal.Vignette"] = function (request, data, root) {
  var i4452 = root || request.c( 'UnityEngine.Rendering.Universal.Vignette' )
  var i4453 = data
  i4452.color = request.d('UnityEngine.Rendering.ColorParameter', i4453[0], i4452.color)
  i4452.center = request.d('UnityEngine.Rendering.Vector2Parameter', i4453[1], i4452.center)
  i4452.intensity = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4453[2], i4452.intensity)
  i4452.smoothness = request.d('UnityEngine.Rendering.ClampedFloatParameter', i4453[3], i4452.smoothness)
  i4452.rounded = request.d('UnityEngine.Rendering.BoolParameter', i4453[4], i4452.rounded)
  i4452.active = !!i4453[5]
  return i4452
}

Deserializers["UnityEngine.Rendering.Vector2Parameter"] = function (request, data, root) {
  var i4454 = root || request.c( 'UnityEngine.Rendering.Vector2Parameter' )
  var i4455 = data
  i4454.m_Value = new pc.Vec2( i4455[0], i4455[1] )
  i4454.m_OverrideState = !!i4455[2]
  return i4454
}

Deserializers["MarbleLevelData"] = function (request, data, root) {
  var i4456 = root || request.c( 'MarbleLevelData' )
  var i4457 = data
  var i4459 = i4457[0]
  var i4458 = new (System.Collections.Generic.List$1(Bridge.ns('MarbleLevelData+ColumnData')))
  for(var i = 0; i < i4459.length; i += 1) {
    i4458.add(request.d('MarbleLevelData+ColumnData', i4459[i + 0]));
  }
  i4456.columns = i4458
  return i4456
}

Deserializers["MarbleLevelData+ColumnData"] = function (request, data, root) {
  var i4462 = root || request.c( 'MarbleLevelData+ColumnData' )
  var i4463 = data
  var i4465 = i4463[0]
  var i4464 = new (System.Collections.Generic.List$1(Bridge.ns('MarbleType')))
  for(var i = 0; i < i4465.length; i += 1) {
    i4464.add(i4465[i + 0]);
  }
  i4462.marbles = i4464
  return i4462
}

Deserializers["MarbleDatabase"] = function (request, data, root) {
  var i4468 = root || request.c( 'MarbleDatabase' )
  var i4469 = data
  var i4471 = i4469[0]
  var i4470 = new (System.Collections.Generic.List$1(Bridge.ns('MarbleDatabase+MarblePrefabEntry')))
  for(var i = 0; i < i4471.length; i += 1) {
    i4470.add(request.d('MarbleDatabase+MarblePrefabEntry', i4471[i + 0]));
  }
  i4468.entries = i4470
  return i4468
}

Deserializers["MarbleDatabase+MarblePrefabEntry"] = function (request, data, root) {
  var i4474 = root || request.c( 'MarbleDatabase+MarblePrefabEntry' )
  var i4475 = data
  i4474.type = i4475[0]
  request.r(i4475[1], i4475[2], 0, i4474, 'prefab')
  return i4474
}

Deserializers["TrayLevelData"] = function (request, data, root) {
  var i4476 = root || request.c( 'TrayLevelData' )
  var i4477 = data
  var i4479 = i4477[0]
  var i4478 = new (System.Collections.Generic.List$1(Bridge.ns('TrayType')))
  for(var i = 0; i < i4479.length; i += 1) {
    i4478.add(i4479[i + 0]);
  }
  i4476.trays = i4478
  return i4476
}

Deserializers["TrayDatabase"] = function (request, data, root) {
  var i4482 = root || request.c( 'TrayDatabase' )
  var i4483 = data
  var i4485 = i4483[0]
  var i4484 = new (System.Collections.Generic.List$1(Bridge.ns('TrayDatabase+TrayPrefabEntry')))
  for(var i = 0; i < i4485.length; i += 1) {
    i4484.add(request.d('TrayDatabase+TrayPrefabEntry', i4485[i + 0]));
  }
  i4482.entries = i4484
  return i4482
}

Deserializers["TrayDatabase+TrayPrefabEntry"] = function (request, data, root) {
  var i4488 = root || request.c( 'TrayDatabase+TrayPrefabEntry' )
  var i4489 = data
  i4488.type = i4489[0]
  request.r(i4489[1], i4489[2], 0, i4488, 'prefab')
  return i4488
}

Deserializers["AudioLibrary"] = function (request, data, root) {
  var i4490 = root || request.c( 'AudioLibrary' )
  var i4491 = data
  var i4493 = i4491[0]
  var i4492 = new (System.Collections.Generic.List$1(Bridge.ns('AudioLibrary+ClipEntry')))
  for(var i = 0; i < i4493.length; i += 1) {
    i4492.add(request.d('AudioLibrary+ClipEntry', i4493[i + 0]));
  }
  i4490.clips = i4492
  return i4490
}

Deserializers["AudioLibrary+ClipEntry"] = function (request, data, root) {
  var i4496 = root || request.c( 'AudioLibrary+ClipEntry' )
  var i4497 = data
  i4496.key = i4497[0]
  i4496.channel = i4497[1]
  request.r(i4497[2], i4497[3], 0, i4496, 'clip')
  i4496.volume = i4497[4]
  i4496.loop = !!i4497[5]
  return i4496
}

Deserializers["DG.Tweening.Core.DOTweenSettings"] = function (request, data, root) {
  var i4498 = root || request.c( 'DG.Tweening.Core.DOTweenSettings' )
  var i4499 = data
  i4498.useSafeMode = !!i4499[0]
  i4498.safeModeOptions = request.d('DG.Tweening.Core.DOTweenSettings+SafeModeOptions', i4499[1], i4498.safeModeOptions)
  i4498.timeScale = i4499[2]
  i4498.unscaledTimeScale = i4499[3]
  i4498.useSmoothDeltaTime = !!i4499[4]
  i4498.maxSmoothUnscaledTime = i4499[5]
  i4498.rewindCallbackMode = i4499[6]
  i4498.showUnityEditorReport = !!i4499[7]
  i4498.logBehaviour = i4499[8]
  i4498.drawGizmos = !!i4499[9]
  i4498.defaultRecyclable = !!i4499[10]
  i4498.defaultAutoPlay = i4499[11]
  i4498.defaultUpdateType = i4499[12]
  i4498.defaultTimeScaleIndependent = !!i4499[13]
  i4498.defaultEaseType = i4499[14]
  i4498.defaultEaseOvershootOrAmplitude = i4499[15]
  i4498.defaultEasePeriod = i4499[16]
  i4498.defaultAutoKill = !!i4499[17]
  i4498.defaultLoopType = i4499[18]
  i4498.debugMode = !!i4499[19]
  i4498.debugStoreTargetId = !!i4499[20]
  i4498.showPreviewPanel = !!i4499[21]
  i4498.storeSettingsLocation = i4499[22]
  i4498.modules = request.d('DG.Tweening.Core.DOTweenSettings+ModulesSetup', i4499[23], i4498.modules)
  i4498.createASMDEF = !!i4499[24]
  i4498.showPlayingTweens = !!i4499[25]
  i4498.showPausedTweens = !!i4499[26]
  return i4498
}

Deserializers["DG.Tweening.Core.DOTweenSettings+SafeModeOptions"] = function (request, data, root) {
  var i4500 = root || request.c( 'DG.Tweening.Core.DOTweenSettings+SafeModeOptions' )
  var i4501 = data
  i4500.logBehaviour = i4501[0]
  i4500.nestedTweenFailureBehaviour = i4501[1]
  return i4500
}

Deserializers["DG.Tweening.Core.DOTweenSettings+ModulesSetup"] = function (request, data, root) {
  var i4502 = root || request.c( 'DG.Tweening.Core.DOTweenSettings+ModulesSetup' )
  var i4503 = data
  i4502.showPanel = !!i4503[0]
  i4502.audioEnabled = !!i4503[1]
  i4502.physicsEnabled = !!i4503[2]
  i4502.physics2DEnabled = !!i4503[3]
  i4502.spriteEnabled = !!i4503[4]
  i4502.uiEnabled = !!i4503[5]
  i4502.textMeshProEnabled = !!i4503[6]
  i4502.tk2DEnabled = !!i4503[7]
  i4502.deAudioEnabled = !!i4503[8]
  i4502.deUnityExtendedEnabled = !!i4503[9]
  i4502.epoOutlineEnabled = !!i4503[10]
  return i4502
}

Deserializers["TMPro.TMP_Settings"] = function (request, data, root) {
  var i4504 = root || request.c( 'TMPro.TMP_Settings' )
  var i4505 = data
  i4504.m_enableWordWrapping = !!i4505[0]
  i4504.m_enableKerning = !!i4505[1]
  i4504.m_enableExtraPadding = !!i4505[2]
  i4504.m_enableTintAllSprites = !!i4505[3]
  i4504.m_enableParseEscapeCharacters = !!i4505[4]
  i4504.m_EnableRaycastTarget = !!i4505[5]
  i4504.m_GetFontFeaturesAtRuntime = !!i4505[6]
  i4504.m_missingGlyphCharacter = i4505[7]
  i4504.m_warningsDisabled = !!i4505[8]
  request.r(i4505[9], i4505[10], 0, i4504, 'm_defaultFontAsset')
  i4504.m_defaultFontAssetPath = i4505[11]
  i4504.m_defaultFontSize = i4505[12]
  i4504.m_defaultAutoSizeMinRatio = i4505[13]
  i4504.m_defaultAutoSizeMaxRatio = i4505[14]
  i4504.m_defaultTextMeshProTextContainerSize = new pc.Vec2( i4505[15], i4505[16] )
  i4504.m_defaultTextMeshProUITextContainerSize = new pc.Vec2( i4505[17], i4505[18] )
  i4504.m_autoSizeTextContainer = !!i4505[19]
  i4504.m_IsTextObjectScaleStatic = !!i4505[20]
  var i4507 = i4505[21]
  var i4506 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i4507.length; i += 2) {
  request.r(i4507[i + 0], i4507[i + 1], 1, i4506, '')
  }
  i4504.m_fallbackFontAssets = i4506
  i4504.m_matchMaterialPreset = !!i4505[22]
  request.r(i4505[23], i4505[24], 0, i4504, 'm_defaultSpriteAsset')
  i4504.m_defaultSpriteAssetPath = i4505[25]
  i4504.m_enableEmojiSupport = !!i4505[26]
  i4504.m_MissingCharacterSpriteUnicode = i4505[27]
  i4504.m_defaultColorGradientPresetsPath = i4505[28]
  request.r(i4505[29], i4505[30], 0, i4504, 'm_defaultStyleSheet')
  i4504.m_StyleSheetsResourcePath = i4505[31]
  request.r(i4505[32], i4505[33], 0, i4504, 'm_leadingCharacters')
  request.r(i4505[34], i4505[35], 0, i4504, 'm_followingCharacters')
  i4504.m_UseModernHangulLineBreakingRules = !!i4505[36]
  return i4504
}

Deserializers["TMPro.TMP_FontAsset"] = function (request, data, root) {
  var i4510 = root || request.c( 'TMPro.TMP_FontAsset' )
  var i4511 = data
  request.r(i4511[0], i4511[1], 0, i4510, 'atlas')
  i4510.normalStyle = i4511[2]
  i4510.normalSpacingOffset = i4511[3]
  i4510.boldStyle = i4511[4]
  i4510.boldSpacing = i4511[5]
  i4510.italicStyle = i4511[6]
  i4510.tabSize = i4511[7]
  i4510.hashCode = i4511[8]
  request.r(i4511[9], i4511[10], 0, i4510, 'material')
  i4510.materialHashCode = i4511[11]
  i4510.m_Version = i4511[12]
  i4510.m_SourceFontFileGUID = i4511[13]
  request.r(i4511[14], i4511[15], 0, i4510, 'm_SourceFontFile_EditorRef')
  request.r(i4511[16], i4511[17], 0, i4510, 'm_SourceFontFile')
  i4510.m_AtlasPopulationMode = i4511[18]
  i4510.m_FaceInfo = request.d('UnityEngine.TextCore.FaceInfo', i4511[19], i4510.m_FaceInfo)
  var i4513 = i4511[20]
  var i4512 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.Glyph')))
  for(var i = 0; i < i4513.length; i += 1) {
    i4512.add(request.d('UnityEngine.TextCore.Glyph', i4513[i + 0]));
  }
  i4510.m_GlyphTable = i4512
  var i4515 = i4511[21]
  var i4514 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Character')))
  for(var i = 0; i < i4515.length; i += 1) {
    i4514.add(request.d('TMPro.TMP_Character', i4515[i + 0]));
  }
  i4510.m_CharacterTable = i4514
  var i4517 = i4511[22]
  var i4516 = []
  for(var i = 0; i < i4517.length; i += 2) {
  request.r(i4517[i + 0], i4517[i + 1], 2, i4516, '')
  }
  i4510.m_AtlasTextures = i4516
  i4510.m_AtlasTextureIndex = i4511[23]
  i4510.m_IsMultiAtlasTexturesEnabled = !!i4511[24]
  i4510.m_ClearDynamicDataOnBuild = !!i4511[25]
  var i4519 = i4511[26]
  var i4518 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.GlyphRect')))
  for(var i = 0; i < i4519.length; i += 1) {
    i4518.add(request.d('UnityEngine.TextCore.GlyphRect', i4519[i + 0]));
  }
  i4510.m_UsedGlyphRects = i4518
  var i4521 = i4511[27]
  var i4520 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.GlyphRect')))
  for(var i = 0; i < i4521.length; i += 1) {
    i4520.add(request.d('UnityEngine.TextCore.GlyphRect', i4521[i + 0]));
  }
  i4510.m_FreeGlyphRects = i4520
  i4510.m_fontInfo = request.d('TMPro.FaceInfo_Legacy', i4511[28], i4510.m_fontInfo)
  i4510.m_AtlasWidth = i4511[29]
  i4510.m_AtlasHeight = i4511[30]
  i4510.m_AtlasPadding = i4511[31]
  i4510.m_AtlasRenderMode = i4511[32]
  var i4523 = i4511[33]
  var i4522 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Glyph')))
  for(var i = 0; i < i4523.length; i += 1) {
    i4522.add(request.d('TMPro.TMP_Glyph', i4523[i + 0]));
  }
  i4510.m_glyphInfoList = i4522
  i4510.m_KerningTable = request.d('TMPro.KerningTable', i4511[34], i4510.m_KerningTable)
  i4510.m_FontFeatureTable = request.d('TMPro.TMP_FontFeatureTable', i4511[35], i4510.m_FontFeatureTable)
  var i4525 = i4511[36]
  var i4524 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i4525.length; i += 2) {
  request.r(i4525[i + 0], i4525[i + 1], 1, i4524, '')
  }
  i4510.fallbackFontAssets = i4524
  var i4527 = i4511[37]
  var i4526 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i4527.length; i += 2) {
  request.r(i4527[i + 0], i4527[i + 1], 1, i4526, '')
  }
  i4510.m_FallbackFontAssetTable = i4526
  i4510.m_CreationSettings = request.d('TMPro.FontAssetCreationSettings', i4511[38], i4510.m_CreationSettings)
  var i4529 = i4511[39]
  var i4528 = []
  for(var i = 0; i < i4529.length; i += 1) {
    i4528.push( request.d('TMPro.TMP_FontWeightPair', i4529[i + 0]) );
  }
  i4510.m_FontWeightTable = i4528
  var i4531 = i4511[40]
  var i4530 = []
  for(var i = 0; i < i4531.length; i += 1) {
    i4530.push( request.d('TMPro.TMP_FontWeightPair', i4531[i + 0]) );
  }
  i4510.fontWeights = i4530
  return i4510
}

Deserializers["UnityEngine.TextCore.FaceInfo"] = function (request, data, root) {
  var i4532 = root || request.c( 'UnityEngine.TextCore.FaceInfo' )
  var i4533 = data
  i4532.m_FaceIndex = i4533[0]
  i4532.m_FamilyName = i4533[1]
  i4532.m_StyleName = i4533[2]
  i4532.m_PointSize = i4533[3]
  i4532.m_Scale = i4533[4]
  i4532.m_UnitsPerEM = i4533[5]
  i4532.m_LineHeight = i4533[6]
  i4532.m_AscentLine = i4533[7]
  i4532.m_CapLine = i4533[8]
  i4532.m_MeanLine = i4533[9]
  i4532.m_Baseline = i4533[10]
  i4532.m_DescentLine = i4533[11]
  i4532.m_SuperscriptOffset = i4533[12]
  i4532.m_SuperscriptSize = i4533[13]
  i4532.m_SubscriptOffset = i4533[14]
  i4532.m_SubscriptSize = i4533[15]
  i4532.m_UnderlineOffset = i4533[16]
  i4532.m_UnderlineThickness = i4533[17]
  i4532.m_StrikethroughOffset = i4533[18]
  i4532.m_StrikethroughThickness = i4533[19]
  i4532.m_TabWidth = i4533[20]
  return i4532
}

Deserializers["UnityEngine.TextCore.Glyph"] = function (request, data, root) {
  var i4536 = root || request.c( 'UnityEngine.TextCore.Glyph' )
  var i4537 = data
  i4536.m_Index = i4537[0]
  i4536.m_Metrics = request.d('UnityEngine.TextCore.GlyphMetrics', i4537[1], i4536.m_Metrics)
  i4536.m_GlyphRect = request.d('UnityEngine.TextCore.GlyphRect', i4537[2], i4536.m_GlyphRect)
  i4536.m_Scale = i4537[3]
  i4536.m_AtlasIndex = i4537[4]
  i4536.m_ClassDefinitionType = i4537[5]
  return i4536
}

Deserializers["UnityEngine.TextCore.GlyphMetrics"] = function (request, data, root) {
  var i4538 = root || request.c( 'UnityEngine.TextCore.GlyphMetrics' )
  var i4539 = data
  i4538.m_Width = i4539[0]
  i4538.m_Height = i4539[1]
  i4538.m_HorizontalBearingX = i4539[2]
  i4538.m_HorizontalBearingY = i4539[3]
  i4538.m_HorizontalAdvance = i4539[4]
  return i4538
}

Deserializers["UnityEngine.TextCore.GlyphRect"] = function (request, data, root) {
  var i4540 = root || request.c( 'UnityEngine.TextCore.GlyphRect' )
  var i4541 = data
  i4540.m_X = i4541[0]
  i4540.m_Y = i4541[1]
  i4540.m_Width = i4541[2]
  i4540.m_Height = i4541[3]
  return i4540
}

Deserializers["TMPro.TMP_Character"] = function (request, data, root) {
  var i4544 = root || request.c( 'TMPro.TMP_Character' )
  var i4545 = data
  i4544.m_ElementType = i4545[0]
  i4544.m_Unicode = i4545[1]
  i4544.m_GlyphIndex = i4545[2]
  i4544.m_Scale = i4545[3]
  return i4544
}

Deserializers["TMPro.FaceInfo_Legacy"] = function (request, data, root) {
  var i4550 = root || request.c( 'TMPro.FaceInfo_Legacy' )
  var i4551 = data
  i4550.Name = i4551[0]
  i4550.PointSize = i4551[1]
  i4550.Scale = i4551[2]
  i4550.CharacterCount = i4551[3]
  i4550.LineHeight = i4551[4]
  i4550.Baseline = i4551[5]
  i4550.Ascender = i4551[6]
  i4550.CapHeight = i4551[7]
  i4550.Descender = i4551[8]
  i4550.CenterLine = i4551[9]
  i4550.SuperscriptOffset = i4551[10]
  i4550.SubscriptOffset = i4551[11]
  i4550.SubSize = i4551[12]
  i4550.Underline = i4551[13]
  i4550.UnderlineThickness = i4551[14]
  i4550.strikethrough = i4551[15]
  i4550.strikethroughThickness = i4551[16]
  i4550.TabWidth = i4551[17]
  i4550.Padding = i4551[18]
  i4550.AtlasWidth = i4551[19]
  i4550.AtlasHeight = i4551[20]
  return i4550
}

Deserializers["TMPro.TMP_Glyph"] = function (request, data, root) {
  var i4554 = root || request.c( 'TMPro.TMP_Glyph' )
  var i4555 = data
  i4554.id = i4555[0]
  i4554.x = i4555[1]
  i4554.y = i4555[2]
  i4554.width = i4555[3]
  i4554.height = i4555[4]
  i4554.xOffset = i4555[5]
  i4554.yOffset = i4555[6]
  i4554.xAdvance = i4555[7]
  i4554.scale = i4555[8]
  return i4554
}

Deserializers["TMPro.KerningTable"] = function (request, data, root) {
  var i4556 = root || request.c( 'TMPro.KerningTable' )
  var i4557 = data
  var i4559 = i4557[0]
  var i4558 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.KerningPair')))
  for(var i = 0; i < i4559.length; i += 1) {
    i4558.add(request.d('TMPro.KerningPair', i4559[i + 0]));
  }
  i4556.kerningPairs = i4558
  return i4556
}

Deserializers["TMPro.KerningPair"] = function (request, data, root) {
  var i4562 = root || request.c( 'TMPro.KerningPair' )
  var i4563 = data
  i4562.xOffset = i4563[0]
  i4562.m_FirstGlyph = i4563[1]
  i4562.m_FirstGlyphAdjustments = request.d('TMPro.GlyphValueRecord_Legacy', i4563[2], i4562.m_FirstGlyphAdjustments)
  i4562.m_SecondGlyph = i4563[3]
  i4562.m_SecondGlyphAdjustments = request.d('TMPro.GlyphValueRecord_Legacy', i4563[4], i4562.m_SecondGlyphAdjustments)
  i4562.m_IgnoreSpacingAdjustments = !!i4563[5]
  return i4562
}

Deserializers["TMPro.TMP_FontFeatureTable"] = function (request, data, root) {
  var i4564 = root || request.c( 'TMPro.TMP_FontFeatureTable' )
  var i4565 = data
  var i4567 = i4565[0]
  var i4566 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_GlyphPairAdjustmentRecord')))
  for(var i = 0; i < i4567.length; i += 1) {
    i4566.add(request.d('TMPro.TMP_GlyphPairAdjustmentRecord', i4567[i + 0]));
  }
  i4564.m_GlyphPairAdjustmentRecords = i4566
  return i4564
}

Deserializers["TMPro.TMP_GlyphPairAdjustmentRecord"] = function (request, data, root) {
  var i4570 = root || request.c( 'TMPro.TMP_GlyphPairAdjustmentRecord' )
  var i4571 = data
  i4570.m_FirstAdjustmentRecord = request.d('TMPro.TMP_GlyphAdjustmentRecord', i4571[0], i4570.m_FirstAdjustmentRecord)
  i4570.m_SecondAdjustmentRecord = request.d('TMPro.TMP_GlyphAdjustmentRecord', i4571[1], i4570.m_SecondAdjustmentRecord)
  i4570.m_FeatureLookupFlags = i4571[2]
  return i4570
}

Deserializers["TMPro.TMP_GlyphAdjustmentRecord"] = function (request, data, root) {
  var i4572 = root || request.c( 'TMPro.TMP_GlyphAdjustmentRecord' )
  var i4573 = data
  i4572.m_GlyphIndex = i4573[0]
  i4572.m_GlyphValueRecord = request.d('TMPro.TMP_GlyphValueRecord', i4573[1], i4572.m_GlyphValueRecord)
  return i4572
}

Deserializers["TMPro.TMP_GlyphValueRecord"] = function (request, data, root) {
  var i4574 = root || request.c( 'TMPro.TMP_GlyphValueRecord' )
  var i4575 = data
  i4574.m_XPlacement = i4575[0]
  i4574.m_YPlacement = i4575[1]
  i4574.m_XAdvance = i4575[2]
  i4574.m_YAdvance = i4575[3]
  return i4574
}

Deserializers["TMPro.FontAssetCreationSettings"] = function (request, data, root) {
  var i4576 = root || request.c( 'TMPro.FontAssetCreationSettings' )
  var i4577 = data
  i4576.sourceFontFileName = i4577[0]
  i4576.sourceFontFileGUID = i4577[1]
  i4576.pointSizeSamplingMode = i4577[2]
  i4576.pointSize = i4577[3]
  i4576.padding = i4577[4]
  i4576.packingMode = i4577[5]
  i4576.atlasWidth = i4577[6]
  i4576.atlasHeight = i4577[7]
  i4576.characterSetSelectionMode = i4577[8]
  i4576.characterSequence = i4577[9]
  i4576.referencedFontAssetGUID = i4577[10]
  i4576.referencedTextAssetGUID = i4577[11]
  i4576.fontStyle = i4577[12]
  i4576.fontStyleModifier = i4577[13]
  i4576.renderMode = i4577[14]
  i4576.includeFontFeatures = !!i4577[15]
  return i4576
}

Deserializers["TMPro.TMP_FontWeightPair"] = function (request, data, root) {
  var i4580 = root || request.c( 'TMPro.TMP_FontWeightPair' )
  var i4581 = data
  request.r(i4581[0], i4581[1], 0, i4580, 'regularTypeface')
  request.r(i4581[2], i4581[3], 0, i4580, 'italicTypeface')
  return i4580
}

Deserializers["TMPro.TMP_SpriteAsset"] = function (request, data, root) {
  var i4582 = root || request.c( 'TMPro.TMP_SpriteAsset' )
  var i4583 = data
  request.r(i4583[0], i4583[1], 0, i4582, 'spriteSheet')
  var i4585 = i4583[2]
  var i4584 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Sprite')))
  for(var i = 0; i < i4585.length; i += 1) {
    i4584.add(request.d('TMPro.TMP_Sprite', i4585[i + 0]));
  }
  i4582.spriteInfoList = i4584
  var i4587 = i4583[3]
  var i4586 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteAsset')))
  for(var i = 0; i < i4587.length; i += 2) {
  request.r(i4587[i + 0], i4587[i + 1], 1, i4586, '')
  }
  i4582.fallbackSpriteAssets = i4586
  i4582.hashCode = i4583[4]
  request.r(i4583[5], i4583[6], 0, i4582, 'material')
  i4582.materialHashCode = i4583[7]
  i4582.m_Version = i4583[8]
  i4582.m_FaceInfo = request.d('UnityEngine.TextCore.FaceInfo', i4583[9], i4582.m_FaceInfo)
  var i4589 = i4583[10]
  var i4588 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteCharacter')))
  for(var i = 0; i < i4589.length; i += 1) {
    i4588.add(request.d('TMPro.TMP_SpriteCharacter', i4589[i + 0]));
  }
  i4582.m_SpriteCharacterTable = i4588
  var i4591 = i4583[11]
  var i4590 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteGlyph')))
  for(var i = 0; i < i4591.length; i += 1) {
    i4590.add(request.d('TMPro.TMP_SpriteGlyph', i4591[i + 0]));
  }
  i4582.m_SpriteGlyphTable = i4590
  return i4582
}

Deserializers["TMPro.TMP_Sprite"] = function (request, data, root) {
  var i4594 = root || request.c( 'TMPro.TMP_Sprite' )
  var i4595 = data
  i4594.name = i4595[0]
  i4594.hashCode = i4595[1]
  i4594.unicode = i4595[2]
  i4594.pivot = new pc.Vec2( i4595[3], i4595[4] )
  request.r(i4595[5], i4595[6], 0, i4594, 'sprite')
  i4594.id = i4595[7]
  i4594.x = i4595[8]
  i4594.y = i4595[9]
  i4594.width = i4595[10]
  i4594.height = i4595[11]
  i4594.xOffset = i4595[12]
  i4594.yOffset = i4595[13]
  i4594.xAdvance = i4595[14]
  i4594.scale = i4595[15]
  return i4594
}

Deserializers["TMPro.TMP_SpriteCharacter"] = function (request, data, root) {
  var i4600 = root || request.c( 'TMPro.TMP_SpriteCharacter' )
  var i4601 = data
  i4600.m_Name = i4601[0]
  i4600.m_HashCode = i4601[1]
  i4600.m_ElementType = i4601[2]
  i4600.m_Unicode = i4601[3]
  i4600.m_GlyphIndex = i4601[4]
  i4600.m_Scale = i4601[5]
  return i4600
}

Deserializers["TMPro.TMP_SpriteGlyph"] = function (request, data, root) {
  var i4604 = root || request.c( 'TMPro.TMP_SpriteGlyph' )
  var i4605 = data
  request.r(i4605[0], i4605[1], 0, i4604, 'sprite')
  i4604.m_Index = i4605[2]
  i4604.m_Metrics = request.d('UnityEngine.TextCore.GlyphMetrics', i4605[3], i4604.m_Metrics)
  i4604.m_GlyphRect = request.d('UnityEngine.TextCore.GlyphRect', i4605[4], i4604.m_GlyphRect)
  i4604.m_Scale = i4605[5]
  i4604.m_AtlasIndex = i4605[6]
  i4604.m_ClassDefinitionType = i4605[7]
  return i4604
}

Deserializers["TMPro.TMP_StyleSheet"] = function (request, data, root) {
  var i4606 = root || request.c( 'TMPro.TMP_StyleSheet' )
  var i4607 = data
  var i4609 = i4607[0]
  var i4608 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Style')))
  for(var i = 0; i < i4609.length; i += 1) {
    i4608.add(request.d('TMPro.TMP_Style', i4609[i + 0]));
  }
  i4606.m_StyleList = i4608
  return i4606
}

Deserializers["TMPro.TMP_Style"] = function (request, data, root) {
  var i4612 = root || request.c( 'TMPro.TMP_Style' )
  var i4613 = data
  i4612.m_Name = i4613[0]
  i4612.m_HashCode = i4613[1]
  i4612.m_OpeningDefinition = i4613[2]
  i4612.m_ClosingDefinition = i4613[3]
  i4612.m_OpeningTagArray = i4613[4]
  i4612.m_ClosingTagArray = i4613[5]
  i4612.m_OpeningTagUnicodeArray = i4613[6]
  i4612.m_ClosingTagUnicodeArray = i4613[7]
  return i4612
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Resources"] = function (request, data, root) {
  var i4614 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Resources' )
  var i4615 = data
  var i4617 = i4615[0]
  var i4616 = []
  for(var i = 0; i < i4617.length; i += 1) {
    i4616.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Resources+File', i4617[i + 0]) );
  }
  i4614.files = i4616
  i4614.componentToPrefabIds = i4615[1]
  return i4614
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Resources+File"] = function (request, data, root) {
  var i4620 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Resources+File' )
  var i4621 = data
  i4620.path = i4621[0]
  request.r(i4621[1], i4621[2], 0, i4620, 'unityObject')
  return i4620
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings"] = function (request, data, root) {
  var i4622 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings' )
  var i4623 = data
  var i4625 = i4623[0]
  var i4624 = []
  for(var i = 0; i < i4625.length; i += 1) {
    i4624.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder', i4625[i + 0]) );
  }
  i4622.scriptsExecutionOrder = i4624
  var i4627 = i4623[1]
  var i4626 = []
  for(var i = 0; i < i4627.length; i += 1) {
    i4626.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer', i4627[i + 0]) );
  }
  i4622.sortingLayers = i4626
  var i4629 = i4623[2]
  var i4628 = []
  for(var i = 0; i < i4629.length; i += 1) {
    i4628.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer', i4629[i + 0]) );
  }
  i4622.cullingLayers = i4628
  i4622.timeSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings', i4623[3], i4622.timeSettings)
  i4622.physicsSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings', i4623[4], i4622.physicsSettings)
  i4622.physics2DSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings', i4623[5], i4622.physics2DSettings)
  i4622.qualitySettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.QualitySettings', i4623[6], i4622.qualitySettings)
  i4622.enableRealtimeShadows = !!i4623[7]
  i4622.enableAutoInstancing = !!i4623[8]
  i4622.enableStaticBatching = !!i4623[9]
  i4622.enableDynamicBatching = !!i4623[10]
  i4622.usePreservativeDynamicBatching = !!i4623[11]
  i4622.lightmapEncodingQuality = i4623[12]
  i4622.desiredColorSpace = i4623[13]
  var i4631 = i4623[14]
  var i4630 = []
  for(var i = 0; i < i4631.length; i += 1) {
    i4630.push( i4631[i + 0] );
  }
  i4622.allTags = i4630
  return i4622
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder"] = function (request, data, root) {
  var i4634 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder' )
  var i4635 = data
  i4634.name = i4635[0]
  i4634.value = i4635[1]
  return i4634
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer"] = function (request, data, root) {
  var i4638 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer' )
  var i4639 = data
  i4638.id = i4639[0]
  i4638.name = i4639[1]
  i4638.value = i4639[2]
  return i4638
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer"] = function (request, data, root) {
  var i4642 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer' )
  var i4643 = data
  i4642.id = i4643[0]
  i4642.name = i4643[1]
  return i4642
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings"] = function (request, data, root) {
  var i4644 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings' )
  var i4645 = data
  i4644.fixedDeltaTime = i4645[0]
  i4644.maximumDeltaTime = i4645[1]
  i4644.timeScale = i4645[2]
  i4644.maximumParticleTimestep = i4645[3]
  return i4644
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings"] = function (request, data, root) {
  var i4646 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings' )
  var i4647 = data
  i4646.gravity = new pc.Vec3( i4647[0], i4647[1], i4647[2] )
  i4646.defaultSolverIterations = i4647[3]
  i4646.bounceThreshold = i4647[4]
  i4646.autoSyncTransforms = !!i4647[5]
  i4646.autoSimulation = !!i4647[6]
  var i4649 = i4647[7]
  var i4648 = []
  for(var i = 0; i < i4649.length; i += 1) {
    i4648.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask', i4649[i + 0]) );
  }
  i4646.collisionMatrix = i4648
  return i4646
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask"] = function (request, data, root) {
  var i4652 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask' )
  var i4653 = data
  i4652.enabled = !!i4653[0]
  i4652.layerId = i4653[1]
  i4652.otherLayerId = i4653[2]
  return i4652
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings"] = function (request, data, root) {
  var i4654 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings' )
  var i4655 = data
  request.r(i4655[0], i4655[1], 0, i4654, 'material')
  i4654.gravity = new pc.Vec2( i4655[2], i4655[3] )
  i4654.positionIterations = i4655[4]
  i4654.velocityIterations = i4655[5]
  i4654.velocityThreshold = i4655[6]
  i4654.maxLinearCorrection = i4655[7]
  i4654.maxAngularCorrection = i4655[8]
  i4654.maxTranslationSpeed = i4655[9]
  i4654.maxRotationSpeed = i4655[10]
  i4654.baumgarteScale = i4655[11]
  i4654.baumgarteTOIScale = i4655[12]
  i4654.timeToSleep = i4655[13]
  i4654.linearSleepTolerance = i4655[14]
  i4654.angularSleepTolerance = i4655[15]
  i4654.defaultContactOffset = i4655[16]
  i4654.autoSimulation = !!i4655[17]
  i4654.queriesHitTriggers = !!i4655[18]
  i4654.queriesStartInColliders = !!i4655[19]
  i4654.callbacksOnDisable = !!i4655[20]
  i4654.reuseCollisionCallbacks = !!i4655[21]
  i4654.autoSyncTransforms = !!i4655[22]
  var i4657 = i4655[23]
  var i4656 = []
  for(var i = 0; i < i4657.length; i += 1) {
    i4656.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask', i4657[i + 0]) );
  }
  i4654.collisionMatrix = i4656
  return i4654
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask"] = function (request, data, root) {
  var i4660 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask' )
  var i4661 = data
  i4660.enabled = !!i4661[0]
  i4660.layerId = i4661[1]
  i4660.otherLayerId = i4661[2]
  return i4660
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.QualitySettings"] = function (request, data, root) {
  var i4662 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.QualitySettings' )
  var i4663 = data
  var i4665 = i4663[0]
  var i4664 = []
  for(var i = 0; i < i4665.length; i += 1) {
    i4664.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.QualitySettings', i4665[i + 0]) );
  }
  i4662.qualityLevels = i4664
  var i4667 = i4663[1]
  var i4666 = []
  for(var i = 0; i < i4667.length; i += 1) {
    i4666.push( i4667[i + 0] );
  }
  i4662.names = i4666
  i4662.shadows = i4663[2]
  i4662.anisotropicFiltering = i4663[3]
  i4662.antiAliasing = i4663[4]
  i4662.lodBias = i4663[5]
  i4662.shadowCascades = i4663[6]
  i4662.shadowDistance = i4663[7]
  i4662.shadowmaskMode = i4663[8]
  i4662.shadowProjection = i4663[9]
  i4662.shadowResolution = i4663[10]
  i4662.softParticles = !!i4663[11]
  i4662.softVegetation = !!i4663[12]
  i4662.activeColorSpace = i4663[13]
  i4662.desiredColorSpace = i4663[14]
  i4662.masterTextureLimit = i4663[15]
  i4662.maxQueuedFrames = i4663[16]
  i4662.particleRaycastBudget = i4663[17]
  i4662.pixelLightCount = i4663[18]
  i4662.realtimeReflectionProbes = !!i4663[19]
  i4662.shadowCascade2Split = i4663[20]
  i4662.shadowCascade4Split = new pc.Vec3( i4663[21], i4663[22], i4663[23] )
  i4662.streamingMipmapsActive = !!i4663[24]
  i4662.vSyncCount = i4663[25]
  i4662.asyncUploadBufferSize = i4663[26]
  i4662.asyncUploadTimeSlice = i4663[27]
  i4662.billboardsFaceCameraPosition = !!i4663[28]
  i4662.shadowNearPlaneOffset = i4663[29]
  i4662.streamingMipmapsMemoryBudget = i4663[30]
  i4662.maximumLODLevel = i4663[31]
  i4662.streamingMipmapsAddAllCameras = !!i4663[32]
  i4662.streamingMipmapsMaxLevelReduction = i4663[33]
  i4662.streamingMipmapsRenderersPerFrame = i4663[34]
  i4662.resolutionScalingFixedDPIFactor = i4663[35]
  i4662.streamingMipmapsMaxFileIORequests = i4663[36]
  i4662.currentQualityLevel = i4663[37]
  return i4662
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame"] = function (request, data, root) {
  var i4672 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame' )
  var i4673 = data
  i4672.weight = i4673[0]
  i4672.vertices = i4673[1]
  i4672.normals = i4673[2]
  i4672.tangents = i4673[3]
  return i4672
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+RenderObjectsSettings"] = function (request, data, root) {
  var i4674 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+RenderObjectsSettings' )
  var i4675 = data
  i4674.Event = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i4675[0], i4674.Event)
  i4674.filterSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+FilterSettings', i4675[1], i4674.filterSettings)
  i4674.overrideMaterialId = i4675[2]
  i4674.overrideMaterialPassIndex = i4675[3]
  i4674.overrideShaderId = i4675[4]
  i4674.overrideShaderPassIndex = i4675[5]
  i4674.overrideMode = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i4675[6], i4674.overrideMode)
  i4674.overrideDepthState = !!i4675[7]
  i4674.depthCompareFunction = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i4675[8], i4674.depthCompareFunction)
  i4674.enableWrite = !!i4675[9]
  i4674.stencilSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.StencilStateData', i4675[10], i4674.stencilSettings)
  i4674.cameraSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+CustomCameraSettings', i4675[11], i4674.cameraSettings)
  return i4674
}

Deserializers["TMPro.GlyphValueRecord_Legacy"] = function (request, data, root) {
  var i4676 = root || request.c( 'TMPro.GlyphValueRecord_Legacy' )
  var i4677 = data
  i4676.xPlacement = i4677[0]
  i4676.yPlacement = i4677[1]
  i4676.xAdvance = i4677[2]
  i4676.yAdvance = i4677[3]
  return i4676
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.EnumDescription"] = function (request, data, root) {
  var i4678 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.EnumDescription' )
  var i4679 = data
  i4678.Value = i4679[0]
  return i4678
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+FilterSettings"] = function (request, data, root) {
  var i4680 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+FilterSettings' )
  var i4681 = data
  i4680.RenderQueueType = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i4681[0], i4680.RenderQueueType)
  i4680.LayerMask = i4681[1]
  var i4683 = i4681[2]
  var i4682 = []
  for(var i = 0; i < i4683.length; i += 1) {
    i4682.push( i4683[i + 0] );
  }
  i4680.PassNames = i4682
  return i4680
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.StencilStateData"] = function (request, data, root) {
  var i4684 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.StencilStateData' )
  var i4685 = data
  i4684.overrideStencilState = !!i4685[0]
  i4684.stencilReference = i4685[1]
  i4684.stencilCompareFunctionValue = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i4685[2], i4684.stencilCompareFunctionValue)
  i4684.passOperationValue = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i4685[3], i4684.passOperationValue)
  i4684.failOperationValue = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i4685[4], i4684.failOperationValue)
  i4684.zFailOperationValue = request.d('Luna.Unity.DTO.UnityEngine.Assets.EnumDescription', i4685[5], i4684.zFailOperationValue)
  return i4684
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+CustomCameraSettings"] = function (request, data, root) {
  var i4686 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+CustomCameraSettings' )
  var i4687 = data
  i4686.overrideCamera = !!i4687[0]
  i4686.restoreCamera = !!i4687[1]
  i4686.offset = new pc.Vec4( i4687[2], i4687[3], i4687[4], i4687[5] )
  i4686.cameraFieldOfView = i4687[6]
  return i4686
}

Deserializers.fields = {"Luna.Unity.DTO.UnityEngine.Assets.Mesh":{"name":0,"halfPrecision":1,"useSimplification":2,"useUInt32IndexFormat":3,"vertexCount":4,"aabb":5,"streams":6,"vertices":7,"subMeshes":8,"bindposes":9,"blendShapes":10},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh":{"triangles":0},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape":{"name":0,"frames":1},"Luna.Unity.DTO.UnityEngine.Assets.Material":{"name":0,"shader":1,"renderQueue":3,"enableInstancing":4,"floatParameters":5,"colorParameters":6,"vectorParameters":7,"textureParameters":8,"materialFlags":9},"Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag":{"name":0,"enabled":1},"Luna.Unity.DTO.UnityEngine.Textures.Texture2D":{"name":0,"width":1,"height":2,"mipmapCount":3,"anisoLevel":4,"filterMode":5,"hdr":6,"format":7,"wrapMode":8,"alphaIsTransparency":9,"alphaSource":10,"graphicsFormat":11,"sRGBTexture":12,"desiredColorSpace":13,"wrapU":14,"wrapV":15},"Luna.Unity.DTO.UnityEngine.Components.Transform":{"position":0,"scale":3,"rotation":6},"Luna.Unity.DTO.UnityEngine.Components.MeshFilter":{"sharedMesh":0},"Luna.Unity.DTO.UnityEngine.Components.MeshRenderer":{"additionalVertexStreams":0,"enabled":2,"sharedMaterial":3,"sharedMaterials":5,"receiveShadows":6,"shadowCastingMode":7,"sortingLayerID":8,"sortingOrder":9,"lightmapIndex":10,"lightmapSceneIndex":11,"lightmapScaleOffset":12,"lightProbeUsage":16,"reflectionProbeUsage":17},"Luna.Unity.DTO.UnityEngine.Components.SphereCollider":{"center":0,"radius":3,"enabled":4,"isTrigger":5,"material":6},"Luna.Unity.DTO.UnityEngine.Scene.GameObject":{"name":0,"tagId":1,"enabled":2,"isStatic":3,"layer":4},"Luna.Unity.DTO.UnityEngine.Textures.Cubemap":{"name":0,"atlasId":1,"mipmapCount":2,"hdr":3,"size":4,"anisoLevel":5,"filterMode":6,"rects":7,"wrapU":8,"wrapV":9},"Luna.Unity.DTO.UnityEngine.Scene.Scene":{"name":0,"index":1,"startup":2},"Luna.Unity.DTO.UnityEngine.Components.Light":{"type":0,"color":1,"cullingMask":5,"intensity":6,"range":7,"spotAngle":8,"shadows":9,"shadowNormalBias":10,"shadowBias":11,"shadowStrength":12,"shadowResolution":13,"lightmapBakeType":14,"renderMode":15,"cookie":16,"cookieSize":18,"shadowNearPlane":19,"occlusionMaskChannel":20,"isBaked":21,"mixedLightingMode":22,"enabled":23},"Luna.Unity.DTO.UnityEngine.Components.Camera":{"aspect":0,"orthographic":1,"orthographicSize":2,"backgroundColor":3,"nearClipPlane":7,"farClipPlane":8,"fieldOfView":9,"depth":10,"clearFlags":11,"cullingMask":12,"rect":13,"targetTexture":14,"usePhysicalProperties":16,"focalLength":17,"sensorSize":18,"lensShift":20,"gateFit":22,"commandBufferCount":23,"cameraType":24,"enabled":25},"Luna.Unity.DTO.UnityEngine.Components.MeshCollider":{"sharedMesh":0,"convex":2,"enabled":3,"isTrigger":4,"material":5},"Luna.Unity.DTO.UnityEngine.Components.RectTransform":{"pivot":0,"anchorMin":2,"anchorMax":4,"sizeDelta":6,"anchoredPosition3D":8,"rotation":11,"scale":15},"Luna.Unity.DTO.UnityEngine.Components.Canvas":{"planeDistance":0,"referencePixelsPerUnit":1,"isFallbackOverlay":2,"renderMode":3,"renderOrder":4,"sortingLayerName":5,"sortingOrder":6,"scaleFactor":7,"worldCamera":8,"overrideSorting":10,"pixelPerfect":11,"targetDisplay":12,"overridePixelPerfect":13,"enabled":14},"Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer":{"cullTransparentMesh":0},"Luna.Unity.DTO.UnityEngine.Components.CanvasGroup":{"m_Alpha":0,"m_Interactable":1,"m_BlocksRaycasts":2,"m_IgnoreParentGroups":3,"enabled":4},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings":{"ambientIntensity":0,"reflectionIntensity":1,"ambientMode":2,"ambientLight":3,"ambientSkyColor":7,"ambientGroundColor":11,"ambientEquatorColor":15,"fogColor":19,"fogEndDistance":23,"fogStartDistance":24,"fogDensity":25,"fog":26,"skybox":27,"fogMode":29,"lightmaps":30,"lightProbes":31,"lightmapsMode":32,"mixedBakeMode":33,"environmentLightingMode":34,"ambientProbe":35,"customReflection":36,"defaultReflection":38,"defaultReflectionMode":40,"defaultReflectionResolution":41,"sunLightObjectId":42,"pixelLightCount":43,"defaultReflectionHDR":44,"hasLightDataAsset":45,"hasManualGenerate":46},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap":{"lightmapColor":0,"lightmapDirection":2,"shadowMask":4},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes":{"bakedProbes":0,"positions":1,"hullRays":2,"tetrahedra":3,"neighbours":4,"matrices":5},"Luna.Unity.DTO.UnityEngine.Assets.UniversalRenderPipelineAsset":{"AdditionalLightsRenderingMode":0,"LightRenderingMode":1,"MainLightRenderingModeValue":2,"SupportsMainLightShadows":3,"MixedLightingSupported":4,"MainLightShadowmapResolutionValue":5,"SupportsSoftShadows":6,"SoftShadowQualityValue":7,"ShadowDistance":8,"ShadowCascadeCount":9,"Cascade2Split":10,"Cascade3Split":11,"Cascade4Split":13,"CascadeBorder":16,"ShadowDepthBias":17,"ShadowNormalBias":18,"RequireDepthTexture":19,"RequireOpaqueTexture":20,"scriptableRendererData":21},"Luna.Unity.DTO.UnityEngine.Assets.LightRenderingMode":{"Disabled":0,"PerVertex":1,"PerPixel":2},"Luna.Unity.DTO.UnityEngine.Assets.ScriptableRendererData":{"opaqueLayerMask":0,"transparentLayerMask":1,"RenderObjectsFeatures":2,"name":3},"Luna.Unity.DTO.UnityEngine.Assets.RenderObjects":{"settings":0,"name":1,"typeName":2},"Luna.Unity.DTO.UnityEngine.Assets.Shader":{"ShaderCompilationErrors":0,"name":1,"guid":2,"shaderDefinedKeywords":3,"passes":4,"usePasses":5,"defaultParameterValues":6,"unityFallbackShader":7,"readDepth":9,"hasDepthOnlyPass":10,"isCreatedByShaderGraph":11,"disableBatching":12,"compiled":13},"Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError":{"shaderName":0,"errorMessage":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass":{"id":0,"subShaderIndex":1,"name":2,"passType":3,"grabPassTextureName":4,"usePass":5,"zTest":6,"zWrite":7,"culling":8,"blending":9,"alphaBlending":10,"colorWriteMask":11,"offsetUnits":12,"offsetFactor":13,"stencilRef":14,"stencilReadMask":15,"stencilWriteMask":16,"stencilOp":17,"stencilOpFront":18,"stencilOpBack":19,"tags":20,"passDefinedKeywords":21,"passDefinedKeywordGroups":22,"variants":23,"excludedVariants":24,"hasDepthReader":25},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value":{"val":0,"name":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending":{"src":0,"dst":1,"op":2},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp":{"pass":0,"fail":1,"zFail":2,"comp":3},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup":{"keywords":0,"hasDiscard":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant":{"passId":0,"subShaderIndex":1,"keywords":2,"vertexProgram":3,"fragmentProgram":4,"exportedForWebGl2":5,"readDepth":6},"Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass":{"shader":0,"pass":2},"Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue":{"name":0,"type":1,"value":2,"textureValue":6,"shaderPropertyFlag":7},"Luna.Unity.DTO.UnityEngine.Textures.Sprite":{"name":0,"texture":1,"aabb":3,"vertices":4,"triangles":5,"textureRect":6,"packedRect":10,"border":14,"transparency":18,"bounds":19,"pixelsPerUnit":20,"textureWidth":21,"textureHeight":22,"nativeSize":23,"pivot":25,"textureRectOffset":27},"Luna.Unity.DTO.UnityEngine.Assets.AudioClip":{"name":0},"Luna.Unity.DTO.UnityEngine.Assets.Font":{"name":0,"ascent":1,"originalLineHeight":2,"fontSize":3,"characterInfo":4,"texture":5,"originalFontSize":7},"Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo":{"index":0,"advance":1,"bearing":2,"glyphWidth":3,"glyphHeight":4,"minX":5,"maxX":6,"minY":7,"maxY":8,"uvBottomLeftX":9,"uvBottomLeftY":10,"uvBottomRightX":11,"uvBottomRightY":12,"uvTopLeftX":13,"uvTopLeftY":14,"uvTopRightX":15,"uvTopRightY":16},"Luna.Unity.DTO.UnityEngine.Assets.TextAsset":{"name":0,"bytes64":1,"data":2},"Luna.Unity.DTO.UnityEngine.Assets.Resources":{"files":0,"componentToPrefabIds":1},"Luna.Unity.DTO.UnityEngine.Assets.Resources+File":{"path":0,"unityObject":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings":{"scriptsExecutionOrder":0,"sortingLayers":1,"cullingLayers":2,"timeSettings":3,"physicsSettings":4,"physics2DSettings":5,"qualitySettings":6,"enableRealtimeShadows":7,"enableAutoInstancing":8,"enableStaticBatching":9,"enableDynamicBatching":10,"usePreservativeDynamicBatching":11,"lightmapEncodingQuality":12,"desiredColorSpace":13,"allTags":14},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer":{"id":0,"name":1,"value":2},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer":{"id":0,"name":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings":{"fixedDeltaTime":0,"maximumDeltaTime":1,"timeScale":2,"maximumParticleTimestep":3},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings":{"gravity":0,"defaultSolverIterations":3,"bounceThreshold":4,"autoSyncTransforms":5,"autoSimulation":6,"collisionMatrix":7},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask":{"enabled":0,"layerId":1,"otherLayerId":2},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings":{"material":0,"gravity":2,"positionIterations":4,"velocityIterations":5,"velocityThreshold":6,"maxLinearCorrection":7,"maxAngularCorrection":8,"maxTranslationSpeed":9,"maxRotationSpeed":10,"baumgarteScale":11,"baumgarteTOIScale":12,"timeToSleep":13,"linearSleepTolerance":14,"angularSleepTolerance":15,"defaultContactOffset":16,"autoSimulation":17,"queriesHitTriggers":18,"queriesStartInColliders":19,"callbacksOnDisable":20,"reuseCollisionCallbacks":21,"autoSyncTransforms":22,"collisionMatrix":23},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask":{"enabled":0,"layerId":1,"otherLayerId":2},"Luna.Unity.DTO.UnityEngine.Assets.QualitySettings":{"qualityLevels":0,"names":1,"shadows":2,"anisotropicFiltering":3,"antiAliasing":4,"lodBias":5,"shadowCascades":6,"shadowDistance":7,"shadowmaskMode":8,"shadowProjection":9,"shadowResolution":10,"softParticles":11,"softVegetation":12,"activeColorSpace":13,"desiredColorSpace":14,"masterTextureLimit":15,"maxQueuedFrames":16,"particleRaycastBudget":17,"pixelLightCount":18,"realtimeReflectionProbes":19,"shadowCascade2Split":20,"shadowCascade4Split":21,"streamingMipmapsActive":24,"vSyncCount":25,"asyncUploadBufferSize":26,"asyncUploadTimeSlice":27,"billboardsFaceCameraPosition":28,"shadowNearPlaneOffset":29,"streamingMipmapsMemoryBudget":30,"maximumLODLevel":31,"streamingMipmapsAddAllCameras":32,"streamingMipmapsMaxLevelReduction":33,"streamingMipmapsRenderersPerFrame":34,"resolutionScalingFixedDPIFactor":35,"streamingMipmapsMaxFileIORequests":36,"currentQualityLevel":37},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame":{"weight":0,"vertices":1,"normals":2,"tangents":3},"Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+RenderObjectsSettings":{"Event":0,"filterSettings":1,"overrideMaterialId":2,"overrideMaterialPassIndex":3,"overrideShaderId":4,"overrideShaderPassIndex":5,"overrideMode":6,"overrideDepthState":7,"depthCompareFunction":8,"enableWrite":9,"stencilSettings":10,"cameraSettings":11},"Luna.Unity.DTO.UnityEngine.Assets.EnumDescription":{"Value":0},"Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+FilterSettings":{"RenderQueueType":0,"LayerMask":1,"PassNames":2},"Luna.Unity.DTO.UnityEngine.Assets.StencilStateData":{"overrideStencilState":0,"stencilReference":1,"stencilCompareFunctionValue":2,"passOperationValue":3,"failOperationValue":4,"zFailOperationValue":5},"Luna.Unity.DTO.UnityEngine.Assets.RenderObjects+CustomCameraSettings":{"overrideCamera":0,"restoreCamera":1,"offset":2,"cameraFieldOfView":6}}

Deserializers.requiredComponents = {"63":[64],"65":[64],"66":[64],"67":[64],"68":[64],"69":[64],"70":[71],"72":[19],"73":[74],"75":[74],"76":[74],"77":[74],"78":[74],"79":[74],"80":[74],"81":[82],"83":[82],"84":[82],"85":[82],"86":[82],"87":[82],"88":[82],"89":[82],"90":[82],"91":[82],"92":[82],"93":[82],"94":[82],"95":[19],"96":[5],"97":[98],"99":[98],"27":[26],"100":[26],"101":[19],"21":[19],"13":[12],"102":[26],"103":[5,26],"104":[26,47],"105":[26],"106":[47,26],"107":[5],"108":[47,26],"109":[26],"110":[111],"112":[111],"113":[111],"114":[26],"115":[26],"46":[27],"43":[47,26],"116":[26],"45":[27],"117":[26],"118":[26],"119":[26],"120":[26],"121":[26],"122":[26],"123":[26],"124":[26],"125":[26],"126":[47,26],"127":[26],"128":[26],"129":[26],"130":[26],"131":[47,26],"132":[26],"133":[17],"134":[17],"18":[17],"135":[17],"136":[19],"137":[19]}

Deserializers.types = ["UnityEngine.Shader","UnityEngine.Texture2D","UnityEngine.Transform","UnityEngine.MeshFilter","UnityEngine.Mesh","UnityEngine.MeshRenderer","UnityEngine.Material","UnityEngine.MonoBehaviour","Marble","UnityEngine.SphereCollider","Tray","TrayAnimation","UnityEngine.Light","UnityEngine.Rendering.Universal.UniversalAdditionalLightData","UnityEngine.Rendering.Volume","UnityEngine.Rendering.VolumeProfile","UnityEngine.EventSystems.UIBehaviour","UnityEngine.EventSystems.EventSystem","UnityEngine.EventSystems.StandaloneInputModule","UnityEngine.Camera","UnityEngine.AudioListener","UnityEngine.Rendering.Universal.UniversalAdditionalCameraData","UnityEngine.MeshCollider","MarbleBoardGenerator","MarbleLevelData","MarbleDatabase","UnityEngine.RectTransform","UnityEngine.Canvas","TrayGenerator","TrayLevelData","TrayDatabase","TrayManager","MarbleAnimationManager","RampWaypoints","MarbleIntroSpawner","MarbleIntroAnimation","CTAManager","EndCardManager","UnityEngine.CanvasGroup","UnityEngine.GameObject","TutorialManager","AudioManager","AudioLibrary","UnityEngine.UI.Image","MarbleColumn","UnityEngine.UI.CanvasScaler","UnityEngine.UI.GraphicRaycaster","UnityEngine.CanvasRenderer","UnityEngine.Sprite","UnityEngine.UI.Button","UnityEngine.Cubemap","UnityEngine.Rendering.Universal.Tonemapping","UnityEngine.Rendering.Universal.Bloom","UnityEngine.Rendering.Universal.MotionBlur","UnityEngine.Rendering.Universal.Vignette","UnityEngine.AudioClip","DG.Tweening.Core.DOTweenSettings","TMPro.TMP_Settings","TMPro.TMP_FontAsset","TMPro.TMP_SpriteAsset","TMPro.TMP_StyleSheet","UnityEngine.TextAsset","UnityEngine.Font","UnityEngine.AudioLowPassFilter","UnityEngine.AudioBehaviour","UnityEngine.AudioHighPassFilter","UnityEngine.AudioReverbFilter","UnityEngine.AudioDistortionFilter","UnityEngine.AudioEchoFilter","UnityEngine.AudioChorusFilter","UnityEngine.Cloth","UnityEngine.SkinnedMeshRenderer","UnityEngine.FlareLayer","UnityEngine.ConstantForce","UnityEngine.Rigidbody","UnityEngine.Joint","UnityEngine.HingeJoint","UnityEngine.SpringJoint","UnityEngine.FixedJoint","UnityEngine.CharacterJoint","UnityEngine.ConfigurableJoint","UnityEngine.CompositeCollider2D","UnityEngine.Rigidbody2D","UnityEngine.Joint2D","UnityEngine.AnchoredJoint2D","UnityEngine.SpringJoint2D","UnityEngine.DistanceJoint2D","UnityEngine.FrictionJoint2D","UnityEngine.HingeJoint2D","UnityEngine.RelativeJoint2D","UnityEngine.SliderJoint2D","UnityEngine.TargetJoint2D","UnityEngine.FixedJoint2D","UnityEngine.WheelJoint2D","UnityEngine.ConstantForce2D","UnityEngine.StreamingController","UnityEngine.TextMesh","UnityEngine.Tilemaps.TilemapRenderer","UnityEngine.Tilemaps.Tilemap","UnityEngine.Tilemaps.TilemapCollider2D","UnityEngine.Rendering.UI.UIFoldout","UnityEngine.Experimental.Rendering.Universal.PixelPerfectCamera","TMPro.TextContainer","TMPro.TextMeshPro","TMPro.TextMeshProUGUI","TMPro.TMP_Dropdown","TMPro.TMP_SelectionCaret","TMPro.TMP_SubMesh","TMPro.TMP_SubMeshUI","TMPro.TMP_Text","Unity.VisualScripting.SceneVariables","Unity.VisualScripting.Variables","Unity.VisualScripting.ScriptMachine","Unity.VisualScripting.StateMachine","UnityEngine.UI.Dropdown","UnityEngine.UI.Graphic","UnityEngine.UI.AspectRatioFitter","UnityEngine.UI.ContentSizeFitter","UnityEngine.UI.GridLayoutGroup","UnityEngine.UI.HorizontalLayoutGroup","UnityEngine.UI.HorizontalOrVerticalLayoutGroup","UnityEngine.UI.LayoutElement","UnityEngine.UI.LayoutGroup","UnityEngine.UI.VerticalLayoutGroup","UnityEngine.UI.Mask","UnityEngine.UI.MaskableGraphic","UnityEngine.UI.RawImage","UnityEngine.UI.RectMask2D","UnityEngine.UI.Scrollbar","UnityEngine.UI.ScrollRect","UnityEngine.UI.Slider","UnityEngine.UI.Text","UnityEngine.UI.Toggle","UnityEngine.EventSystems.BaseInputModule","UnityEngine.EventSystems.PointerInputModule","UnityEngine.EventSystems.TouchInputModule","UnityEngine.EventSystems.Physics2DRaycaster","UnityEngine.EventSystems.PhysicsRaycaster"]

Deserializers.unityVersion = "2023.1.0f1";

Deserializers.productName = "Ludios";

Deserializers.lunaInitializationTime = "11/03/2026 05:45:41";

Deserializers.lunaDaysRunning = "0.0";

Deserializers.lunaVersion = "7.2.0";

Deserializers.lunaSHA = "ea08d29afe2968efcb8d91d5624f033c6485cc68";

Deserializers.creativeName = "Ludios";

Deserializers.lunaAppID = "37132";

Deserializers.projectId = "452be7a89c115bc4796b4acf29b5bc0e";

Deserializers.packagesInfo = "com.unity.render-pipelines.universal: 15.0.6\ncom.unity.textmeshpro: 3.0.6\ncom.unity.timeline: 1.8.2\ncom.unity.ugui: 1.0.0";

Deserializers.externalJsLibraries = "";

Deserializers.androidLink = ( typeof window !== "undefined")&&window.$environment.packageConfig.androidLink?window.$environment.packageConfig.androidLink:'Empty';

Deserializers.iosLink = ( typeof window !== "undefined")&&window.$environment.packageConfig.iosLink?window.$environment.packageConfig.iosLink:'Empty';

Deserializers.base64Enabled = "False";

Deserializers.minifyEnabled = "True";

Deserializers.isForceUncompressed = "False";

Deserializers.isAntiAliasingEnabled = "False";

Deserializers.isRuntimeAnalysisEnabledForCode = "False";

Deserializers.runtimeAnalysisExcludedClassesCount = "0";

Deserializers.runtimeAnalysisExcludedMethodsCount = "0";

Deserializers.runtimeAnalysisExcludedModules = "";

Deserializers.isRuntimeAnalysisEnabledForShaders = "False";

Deserializers.isRealtimeShadowsEnabled = "True";

Deserializers.isLunaCompilerV2Used = "False";

Deserializers.companyName = "DefaultCompany";

Deserializers.buildPlatform = "StandaloneWindows64";

Deserializers.applicationIdentifier = "com.Unity-Technologies.com.unity.template.urp-blank";

Deserializers.disableAntiAliasing = true;

Deserializers.graphicsConstraint = 24;

Deserializers.linearColorSpace = true;

Deserializers.buildID = "91d87fb8-661c-41e4-8c89-a83b504d7498";

Deserializers.runtimeInitializeOnLoadInfos = [[["UnityEngine","Rendering","DebugUpdater","RuntimeInit"],["UnityEngine","Experimental","Rendering","ScriptableRuntimeReflectionSystemSettings","ScriptingDirtyReflectionSystemInstance"]],[["Unity","VisualScripting","RuntimeVSUsageUtility","RuntimeInitializeOnLoadBeforeSceneLoad"]],[],[["UnityEngine","Experimental","Rendering","XRSystem","XRSystemInit"]],[]];

Deserializers.typeNameToIdMap = function(){ var i = 0; return Deserializers.types.reduce( function( res, item ) { res[ item ] = i++; return res; }, {} ) }()

