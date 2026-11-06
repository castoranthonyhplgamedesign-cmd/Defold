var Deserializers = {}
Deserializers["UnityEngine.JointSpring"] = function (request, data, root) {
  var i658 = root || request.c( 'UnityEngine.JointSpring' )
  var i659 = data
  i658.spring = i659[0]
  i658.damper = i659[1]
  i658.targetPosition = i659[2]
  return i658
}

Deserializers["UnityEngine.JointMotor"] = function (request, data, root) {
  var i660 = root || request.c( 'UnityEngine.JointMotor' )
  var i661 = data
  i660.m_TargetVelocity = i661[0]
  i660.m_Force = i661[1]
  i660.m_FreeSpin = i661[2]
  return i660
}

Deserializers["UnityEngine.JointLimits"] = function (request, data, root) {
  var i662 = root || request.c( 'UnityEngine.JointLimits' )
  var i663 = data
  i662.m_Min = i663[0]
  i662.m_Max = i663[1]
  i662.m_Bounciness = i663[2]
  i662.m_BounceMinVelocity = i663[3]
  i662.m_ContactDistance = i663[4]
  i662.minBounce = i663[5]
  i662.maxBounce = i663[6]
  return i662
}

Deserializers["UnityEngine.JointDrive"] = function (request, data, root) {
  var i664 = root || request.c( 'UnityEngine.JointDrive' )
  var i665 = data
  i664.m_PositionSpring = i665[0]
  i664.m_PositionDamper = i665[1]
  i664.m_MaximumForce = i665[2]
  i664.m_UseAcceleration = i665[3]
  return i664
}

Deserializers["UnityEngine.SoftJointLimitSpring"] = function (request, data, root) {
  var i666 = root || request.c( 'UnityEngine.SoftJointLimitSpring' )
  var i667 = data
  i666.m_Spring = i667[0]
  i666.m_Damper = i667[1]
  return i666
}

Deserializers["UnityEngine.SoftJointLimit"] = function (request, data, root) {
  var i668 = root || request.c( 'UnityEngine.SoftJointLimit' )
  var i669 = data
  i668.m_Limit = i669[0]
  i668.m_Bounciness = i669[1]
  i668.m_ContactDistance = i669[2]
  return i668
}

Deserializers["UnityEngine.WheelFrictionCurve"] = function (request, data, root) {
  var i670 = root || request.c( 'UnityEngine.WheelFrictionCurve' )
  var i671 = data
  i670.m_ExtremumSlip = i671[0]
  i670.m_ExtremumValue = i671[1]
  i670.m_AsymptoteSlip = i671[2]
  i670.m_AsymptoteValue = i671[3]
  i670.m_Stiffness = i671[4]
  return i670
}

Deserializers["UnityEngine.JointAngleLimits2D"] = function (request, data, root) {
  var i672 = root || request.c( 'UnityEngine.JointAngleLimits2D' )
  var i673 = data
  i672.m_LowerAngle = i673[0]
  i672.m_UpperAngle = i673[1]
  return i672
}

Deserializers["UnityEngine.JointMotor2D"] = function (request, data, root) {
  var i674 = root || request.c( 'UnityEngine.JointMotor2D' )
  var i675 = data
  i674.m_MotorSpeed = i675[0]
  i674.m_MaximumMotorTorque = i675[1]
  return i674
}

Deserializers["UnityEngine.JointSuspension2D"] = function (request, data, root) {
  var i676 = root || request.c( 'UnityEngine.JointSuspension2D' )
  var i677 = data
  i676.m_DampingRatio = i677[0]
  i676.m_Frequency = i677[1]
  i676.m_Angle = i677[2]
  return i676
}

Deserializers["UnityEngine.JointTranslationLimits2D"] = function (request, data, root) {
  var i678 = root || request.c( 'UnityEngine.JointTranslationLimits2D' )
  var i679 = data
  i678.m_LowerTranslation = i679[0]
  i678.m_UpperTranslation = i679[1]
  return i678
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Texture2D"] = function (request, data, root) {
  var i680 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Texture2D' )
  var i681 = data
  i680.name = i681[0]
  i680.width = i681[1]
  i680.height = i681[2]
  i680.mipmapCount = i681[3]
  i680.anisoLevel = i681[4]
  i680.filterMode = i681[5]
  i680.hdr = !!i681[6]
  i680.format = i681[7]
  i680.wrapMode = i681[8]
  i680.alphaIsTransparency = !!i681[9]
  i680.alphaSource = i681[10]
  i680.graphicsFormat = i681[11]
  i680.sRGBTexture = !!i681[12]
  i680.desiredColorSpace = i681[13]
  i680.wrapU = i681[14]
  i680.wrapV = i681[15]
  return i680
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh"] = function (request, data, root) {
  var i682 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh' )
  var i683 = data
  i682.name = i683[0]
  i682.halfPrecision = !!i683[1]
  i682.useSimplification = !!i683[2]
  i682.useUInt32IndexFormat = !!i683[3]
  i682.vertexCount = i683[4]
  i682.aabb = i683[5]
  var i685 = i683[6]
  var i684 = []
  for(var i = 0; i < i685.length; i += 1) {
    i684.push( !!i685[i + 0] );
  }
  i682.streams = i684
  i682.vertices = i683[7]
  var i687 = i683[8]
  var i686 = []
  for(var i = 0; i < i687.length; i += 1) {
    i686.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh', i687[i + 0]) );
  }
  i682.subMeshes = i686
  var i689 = i683[9]
  var i688 = []
  for(var i = 0; i < i689.length; i += 16) {
    i688.push( new pc.Mat4().setData(i689[i + 0], i689[i + 1], i689[i + 2], i689[i + 3],  i689[i + 4], i689[i + 5], i689[i + 6], i689[i + 7],  i689[i + 8], i689[i + 9], i689[i + 10], i689[i + 11],  i689[i + 12], i689[i + 13], i689[i + 14], i689[i + 15]) );
  }
  i682.bindposes = i688
  var i691 = i683[10]
  var i690 = []
  for(var i = 0; i < i691.length; i += 1) {
    i690.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape', i691[i + 0]) );
  }
  i682.blendShapes = i690
  return i682
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh"] = function (request, data, root) {
  var i696 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh' )
  var i697 = data
  i696.triangles = i697[0]
  return i696
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape"] = function (request, data, root) {
  var i702 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape' )
  var i703 = data
  i702.name = i703[0]
  var i705 = i703[1]
  var i704 = []
  for(var i = 0; i < i705.length; i += 1) {
    i704.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame', i705[i + 0]) );
  }
  i702.frames = i704
  return i702
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material"] = function (request, data, root) {
  var i706 = root || new pc.UnityMaterial()
  var i707 = data
  i706.name = i707[0]
  request.r(i707[1], i707[2], 0, i706, 'shader')
  i706.renderQueue = i707[3]
  i706.enableInstancing = !!i707[4]
  var i709 = i707[5]
  var i708 = []
  for(var i = 0; i < i709.length; i += 1) {
    i708.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter', i709[i + 0]) );
  }
  i706.floatParameters = i708
  var i711 = i707[6]
  var i710 = []
  for(var i = 0; i < i711.length; i += 1) {
    i710.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter', i711[i + 0]) );
  }
  i706.colorParameters = i710
  var i713 = i707[7]
  var i712 = []
  for(var i = 0; i < i713.length; i += 1) {
    i712.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter', i713[i + 0]) );
  }
  i706.vectorParameters = i712
  var i715 = i707[8]
  var i714 = []
  for(var i = 0; i < i715.length; i += 1) {
    i714.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter', i715[i + 0]) );
  }
  i706.textureParameters = i714
  var i717 = i707[9]
  var i716 = []
  for(var i = 0; i < i717.length; i += 1) {
    i716.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag', i717[i + 0]) );
  }
  i706.materialFlags = i716
  return i706
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter"] = function (request, data, root) {
  var i720 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter' )
  var i721 = data
  i720.name = i721[0]
  i720.value = i721[1]
  return i720
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter"] = function (request, data, root) {
  var i724 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter' )
  var i725 = data
  i724.name = i725[0]
  i724.value = new pc.Color(i725[1], i725[2], i725[3], i725[4])
  return i724
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter"] = function (request, data, root) {
  var i728 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter' )
  var i729 = data
  i728.name = i729[0]
  i728.value = new pc.Vec4( i729[1], i729[2], i729[3], i729[4] )
  return i728
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter"] = function (request, data, root) {
  var i732 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter' )
  var i733 = data
  i732.name = i733[0]
  request.r(i733[1], i733[2], 0, i732, 'value')
  return i732
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag"] = function (request, data, root) {
  var i736 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag' )
  var i737 = data
  i736.name = i737[0]
  i736.enabled = !!i737[1]
  return i736
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Cubemap"] = function (request, data, root) {
  var i738 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Cubemap' )
  var i739 = data
  i738.name = i739[0]
  i738.atlasId = i739[1]
  i738.mipmapCount = i739[2]
  i738.hdr = !!i739[3]
  i738.size = i739[4]
  i738.anisoLevel = i739[5]
  i738.filterMode = i739[6]
  var i741 = i739[7]
  var i740 = []
  for(var i = 0; i < i741.length; i += 4) {
    i740.push( UnityEngine.Rect.MinMaxRect(i741[i + 0], i741[i + 1], i741[i + 2], i741[i + 3]) );
  }
  i738.rects = i740
  i738.wrapU = i739[8]
  i738.wrapV = i739[9]
  return i738
}

Deserializers["Luna.Unity.DTO.UnityEngine.Scene.Scene"] = function (request, data, root) {
  var i744 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Scene.Scene' )
  var i745 = data
  i744.name = i745[0]
  i744.index = i745[1]
  i744.startup = !!i745[2]
  return i744
}

Deserializers["CTAManager"] = function (request, data, root) {
  var i746 = root || request.c( 'CTAManager' )
  var i747 = data
  i746.IsCTA = !!i747[0]
  i746.iosLink = i747[1]
  i746.androidLink = i747[2]
  return i746
}

Deserializers["ControlManager"] = function (request, data, root) {
  var i748 = root || request.c( 'ControlManager' )
  var i749 = data
  i748.IsGameLocked = !!i749[0]
  i748.IsHolding = !!i749[1]
  i748.controlLayer = UnityEngine.LayerMask.FromIntegerValue( i749[2] )
  var i751 = i749[3]
  var i750 = []
  for(var i = 0; i < i751.length; i += 2) {
  request.r(i751[i + 0], i751[i + 1], 2, i750, '')
  }
  i748.deactivate = i750
  var i753 = i749[4]
  var i752 = []
  for(var i = 0; i < i753.length; i += 2) {
  request.r(i753[i + 0], i753[i + 1], 2, i752, '')
  }
  i748.activate = i752
  return i748
}

Deserializers["IterationVariantManagers"] = function (request, data, root) {
  var i756 = root || request.c( 'IterationVariantManagers' )
  var i757 = data
  i756.ActiveIterationType = i757[0]
  i756.ActiveVariantType = i757[1]
  var i759 = i757[2]
  var i758 = []
  for(var i = 0; i < i759.length; i += 2) {
  request.r(i759[i + 0], i759[i + 1], 2, i758, '')
  }
  i756.clickTexts = i758
  var i761 = i757[3]
  var i760 = []
  for(var i = 0; i < i761.length; i += 2) {
  request.r(i761[i + 0], i761[i + 1], 2, i760, '')
  }
  i756.timerTexts = i760
  var i763 = i757[4]
  var i762 = []
  for(var i = 0; i < i763.length; i += 2) {
  request.r(i763[i + 0], i763[i + 1], 2, i762, '')
  }
  i756.variants = i762
  var i765 = i757[5]
  var i764 = []
  for(var i = 0; i < i765.length; i += 2) {
  request.r(i765[i + 0], i765[i + 1], 2, i764, '')
  }
  i756.endCards = i764
  i756.endCardAnimationDuration = i757[6]
  i756.scoreTarget = i757[7]
  return i756
}

Deserializers["ScoreManager"] = function (request, data, root) {
  var i770 = root || request.c( 'ScoreManager' )
  var i771 = data
  request.r(i771[0], i771[1], 0, i770, 'fillBar')
  request.r(i771[2], i771[3], 0, i770, 'fillImage')
  var i773 = i771[4]
  var i772 = []
  for(var i = 0; i < i773.length; i += 2) {
  request.r(i773[i + 0], i773[i + 1], 2, i772, '')
  }
  i770.scoreTexts = i772
  i770.startingFillPercent = i771[5]
  return i770
}

Deserializers["Luna.Unity.DTO.UnityEngine.Scene.GameObject"] = function (request, data, root) {
  var i774 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Scene.GameObject' )
  var i775 = data
  i774.name = i775[0]
  i774.tagId = i775[1]
  i774.enabled = !!i775[2]
  i774.isStatic = !!i775[3]
  i774.layer = i775[4]
  return i774
}

Deserializers["CameraManager"] = function (request, data, root) {
  var i776 = root || request.c( 'CameraManager' )
  var i777 = data
  i776.IsPan = !!i777[0]
  i776.PanLayer = UnityEngine.LayerMask.FromIntegerValue( i777[1] )
  i776.PanAxis = i777[2]
  i776.IsZoom = !!i777[3]
  i776.IsShake = !!i777[4]
  i776.IsAnimation = !!i777[5]
  i776.IsAnimationSeq = !!i777[6]
  i776.originVector = new pc.Vec3( i777[7], i777[8], i777[9] )
  i776.zoomIn = i777[10]
  i776.zoomOut = i777[11]
  var i779 = i777[12]
  var i778 = []
  for(var i = 0; i < i779.length; i += 1) {
    i778.push( request.d('AnimationStep', i779[i + 0]) );
  }
  i776.animationSteps = i778
  var i781 = i777[13]
  var i780 = []
  for(var i = 0; i < i781.length; i += 1) {
    i780.push( request.d('AnimationSeqStep', i781[i + 0]) );
  }
  i776.animationSeqSteps = i780
  return i776
}

Deserializers["AnimationStep"] = function (request, data, root) {
  var i784 = root || request.c( 'AnimationStep' )
  var i785 = data
  i784.target = new pc.Vec3( i785[0], i785[1], i785[2] )
  i784.duration = i785[3]
  i784.zoom = i785[4]
  return i784
}

Deserializers["AnimationSeqStep"] = function (request, data, root) {
  var i788 = root || request.c( 'AnimationSeqStep' )
  var i789 = data
  i788.target = new pc.Vec3( i789[0], i789[1], i789[2] )
  i788.duration = i789[3]
  i788.pause = i789[4]
  i788.zoom = i789[5]
  i788.ease = i789[6]
  return i788
}

Deserializers["CameraFitter"] = function (request, data, root) {
  var i790 = root || request.c( 'CameraFitter' )
  var i791 = data
  i790.baseOrthoSize = i791[0]
  i790.phoneReferenceAspect = i791[1]
  i790.tabletReferenceAspect = i791[2]
  i790.tabletAspectThreshold = i791[3]
  i790.minOrthoSize = i791[4]
  i790.maxOrthoSize = i791[5]
  i790.tabletMinOrthoSize = i791[6]
  i790.tabletMaxOrthoSize = i791[7]
  i790.landscapeFitByHeight = !!i791[8]
  var i793 = i791[9]
  var i792 = []
  for(var i = 0; i < i793.length; i += 2) {
  request.r(i793[i + 0], i793[i + 1], 2, i792, '')
  }
  i790.uiScale = i792
  return i790
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Camera"] = function (request, data, root) {
  var i796 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Camera' )
  var i797 = data
  i796.aspect = i797[0]
  i796.orthographic = !!i797[1]
  i796.orthographicSize = i797[2]
  i796.backgroundColor = new pc.Color(i797[3], i797[4], i797[5], i797[6])
  i796.nearClipPlane = i797[7]
  i796.farClipPlane = i797[8]
  i796.fieldOfView = i797[9]
  i796.depth = i797[10]
  i796.clearFlags = i797[11]
  i796.cullingMask = i797[12]
  i796.rect = i797[13]
  request.r(i797[14], i797[15], 0, i796, 'targetTexture')
  i796.usePhysicalProperties = !!i797[16]
  i796.focalLength = i797[17]
  i796.sensorSize = new pc.Vec2( i797[18], i797[19] )
  i796.lensShift = new pc.Vec2( i797[20], i797[21] )
  i796.gateFit = i797[22]
  i796.commandBufferCount = i797[23]
  i796.cameraType = i797[24]
  i796.enabled = !!i797[25]
  return i796
}

Deserializers["UnityEngine.EventSystems.EventSystem"] = function (request, data, root) {
  var i798 = root || request.c( 'UnityEngine.EventSystems.EventSystem' )
  var i799 = data
  request.r(i799[0], i799[1], 0, i798, 'm_FirstSelected')
  i798.m_sendNavigationEvents = !!i799[2]
  i798.m_DragThreshold = i799[3]
  return i798
}

Deserializers["UnityEngine.EventSystems.StandaloneInputModule"] = function (request, data, root) {
  var i800 = root || request.c( 'UnityEngine.EventSystems.StandaloneInputModule' )
  var i801 = data
  i800.m_HorizontalAxis = i801[0]
  i800.m_VerticalAxis = i801[1]
  i800.m_SubmitButton = i801[2]
  i800.m_CancelButton = i801[3]
  i800.m_InputActionsPerSecond = i801[4]
  i800.m_RepeatDelay = i801[5]
  i800.m_ForceModuleActive = !!i801[6]
  i800.m_SendPointerHoverToParent = !!i801[7]
  return i800
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Light"] = function (request, data, root) {
  var i802 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Light' )
  var i803 = data
  i802.type = i803[0]
  i802.color = new pc.Color(i803[1], i803[2], i803[3], i803[4])
  i802.cullingMask = i803[5]
  i802.intensity = i803[6]
  i802.range = i803[7]
  i802.spotAngle = i803[8]
  i802.shadows = i803[9]
  i802.shadowNormalBias = i803[10]
  i802.shadowBias = i803[11]
  i802.shadowStrength = i803[12]
  i802.shadowResolution = i803[13]
  i802.lightmapBakeType = i803[14]
  i802.renderMode = i803[15]
  request.r(i803[16], i803[17], 0, i802, 'cookie')
  i802.cookieSize = i803[18]
  i802.shadowNearPlane = i803[19]
  i802.occlusionMaskChannel = i803[20]
  i802.isBaked = !!i803[21]
  i802.mixedLightingMode = i803[22]
  i802.enabled = !!i803[23]
  return i802
}

Deserializers["AudioManager"] = function (request, data, root) {
  var i804 = root || request.c( 'AudioManager' )
  var i805 = data
  request.r(i805[0], i805[1], 0, i804, 'library')
  i804.sfxPoolSize = i805[2]
  return i804
}

Deserializers["GameManager"] = function (request, data, root) {
  var i806 = root || request.c( 'GameManager' )
  var i807 = data
  request.r(i807[0], i807[1], 0, i806, 'Board')
  i806.IsHintActive = !!i807[2]
  i806.HasUsedStartingHint = !!i807[3]
  request.r(i807[4], i807[5], 0, i806, 'handPointer')
  request.r(i807[6], i807[7], 0, i806, 'handRenderer')
  var i809 = i807[8]
  var i808 = []
  for(var i = 0; i < i809.length; i += 2) {
  request.r(i809[i + 0], i809[i + 1], 2, i808, '')
  }
  i806.highlight = i808
  request.r(i807[9], i807[10], 0, i806, 'hintedBrick')
  i806.hintDelay = i807[11]
  i806.hintTimer = i807[12]
  request.r(i807[13], i807[14], 0, i806, 'startingBrick')
  i806.startingDirection = new pc.Vec3( i807[15], i807[16], i807[17] )
  return i806
}

Deserializers["BoardManager"] = function (request, data, root) {
  var i810 = root || request.c( 'BoardManager' )
  var i811 = data
  var i813 = i811[0]
  var i812 = new (System.Collections.Generic.List$1(Bridge.ns('GridSlot')))
  for(var i = 0; i < i813.length; i += 2) {
  request.r(i813[i + 0], i813[i + 1], 1, i812, '')
  }
  i810.slots = i812
  var i815 = i811[1]
  var i814 = new (System.Collections.Generic.List$1(Bridge.ns('Brick')))
  for(var i = 0; i < i815.length; i += 2) {
  request.r(i815[i + 0], i815[i + 1], 1, i814, '')
  }
  i810.bricks = i814
  return i810
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.MeshFilter"] = function (request, data, root) {
  var i820 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.MeshFilter' )
  var i821 = data
  request.r(i821[0], i821[1], 0, i820, 'sharedMesh')
  return i820
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.MeshRenderer"] = function (request, data, root) {
  var i822 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.MeshRenderer' )
  var i823 = data
  request.r(i823[0], i823[1], 0, i822, 'additionalVertexStreams')
  i822.enabled = !!i823[2]
  request.r(i823[3], i823[4], 0, i822, 'sharedMaterial')
  var i825 = i823[5]
  var i824 = []
  for(var i = 0; i < i825.length; i += 2) {
  request.r(i825[i + 0], i825[i + 1], 2, i824, '')
  }
  i822.sharedMaterials = i824
  i822.receiveShadows = !!i823[6]
  i822.shadowCastingMode = i823[7]
  i822.sortingLayerID = i823[8]
  i822.sortingOrder = i823[9]
  i822.lightmapIndex = i823[10]
  i822.lightmapSceneIndex = i823[11]
  i822.lightmapScaleOffset = new pc.Vec4( i823[12], i823[13], i823[14], i823[15] )
  i822.lightProbeUsage = i823[16]
  i822.reflectionProbeUsage = i823[17]
  return i822
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.RectTransform"] = function (request, data, root) {
  var i828 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.RectTransform' )
  var i829 = data
  i828.pivot = new pc.Vec2( i829[0], i829[1] )
  i828.anchorMin = new pc.Vec2( i829[2], i829[3] )
  i828.anchorMax = new pc.Vec2( i829[4], i829[5] )
  i828.sizeDelta = new pc.Vec2( i829[6], i829[7] )
  i828.anchoredPosition3D = new pc.Vec3( i829[8], i829[9], i829[10] )
  i828.rotation = new pc.Quat(i829[11], i829[12], i829[13], i829[14])
  i828.scale = new pc.Vec3( i829[15], i829[16], i829[17] )
  return i828
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Canvas"] = function (request, data, root) {
  var i830 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Canvas' )
  var i831 = data
  i830.planeDistance = i831[0]
  i830.referencePixelsPerUnit = i831[1]
  i830.isFallbackOverlay = !!i831[2]
  i830.renderMode = i831[3]
  i830.renderOrder = i831[4]
  i830.sortingLayerName = i831[5]
  i830.sortingOrder = i831[6]
  i830.scaleFactor = i831[7]
  request.r(i831[8], i831[9], 0, i830, 'worldCamera')
  i830.overrideSorting = !!i831[10]
  i830.pixelPerfect = !!i831[11]
  i830.targetDisplay = i831[12]
  i830.overridePixelPerfect = !!i831[13]
  i830.enabled = !!i831[14]
  return i830
}

Deserializers["UnityEngine.UI.CanvasScaler"] = function (request, data, root) {
  var i832 = root || request.c( 'UnityEngine.UI.CanvasScaler' )
  var i833 = data
  i832.m_UiScaleMode = i833[0]
  i832.m_ReferencePixelsPerUnit = i833[1]
  i832.m_ScaleFactor = i833[2]
  i832.m_ReferenceResolution = new pc.Vec2( i833[3], i833[4] )
  i832.m_ScreenMatchMode = i833[5]
  i832.m_MatchWidthOrHeight = i833[6]
  i832.m_PhysicalUnit = i833[7]
  i832.m_FallbackScreenDPI = i833[8]
  i832.m_DefaultSpriteDPI = i833[9]
  i832.m_DynamicPixelsPerUnit = i833[10]
  i832.m_PresetInfoIsWorld = !!i833[11]
  return i832
}

Deserializers["UnityEngine.UI.GraphicRaycaster"] = function (request, data, root) {
  var i834 = root || request.c( 'UnityEngine.UI.GraphicRaycaster' )
  var i835 = data
  i834.m_IgnoreReversedGraphics = !!i835[0]
  i834.m_BlockingObjects = i835[1]
  i834.m_BlockingMask = UnityEngine.LayerMask.FromIntegerValue( i835[2] )
  return i834
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer"] = function (request, data, root) {
  var i836 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer' )
  var i837 = data
  i836.cullTransparentMesh = !!i837[0]
  return i836
}

Deserializers["UnityEngine.UI.Image"] = function (request, data, root) {
  var i838 = root || request.c( 'UnityEngine.UI.Image' )
  var i839 = data
  request.r(i839[0], i839[1], 0, i838, 'm_Sprite')
  i838.m_Type = i839[2]
  i838.m_PreserveAspect = !!i839[3]
  i838.m_FillCenter = !!i839[4]
  i838.m_FillMethod = i839[5]
  i838.m_FillAmount = i839[6]
  i838.m_FillClockwise = !!i839[7]
  i838.m_FillOrigin = i839[8]
  i838.m_UseSpriteMesh = !!i839[9]
  i838.m_PixelsPerUnitMultiplier = i839[10]
  request.r(i839[11], i839[12], 0, i838, 'm_Material')
  i838.m_Maskable = !!i839[13]
  i838.m_Color = new pc.Color(i839[14], i839[15], i839[16], i839[17])
  i838.m_RaycastTarget = !!i839[18]
  i838.m_RaycastPadding = new pc.Vec4( i839[19], i839[20], i839[21], i839[22] )
  return i838
}

Deserializers["UnityEngine.UI.Button"] = function (request, data, root) {
  var i840 = root || request.c( 'UnityEngine.UI.Button' )
  var i841 = data
  i840.m_OnClick = request.d('UnityEngine.UI.Button+ButtonClickedEvent', i841[0], i840.m_OnClick)
  i840.m_Navigation = request.d('UnityEngine.UI.Navigation', i841[1], i840.m_Navigation)
  i840.m_Transition = i841[2]
  i840.m_Colors = request.d('UnityEngine.UI.ColorBlock', i841[3], i840.m_Colors)
  i840.m_SpriteState = request.d('UnityEngine.UI.SpriteState', i841[4], i840.m_SpriteState)
  i840.m_AnimationTriggers = request.d('UnityEngine.UI.AnimationTriggers', i841[5], i840.m_AnimationTriggers)
  i840.m_Interactable = !!i841[6]
  request.r(i841[7], i841[8], 0, i840, 'm_TargetGraphic')
  return i840
}

Deserializers["UnityEngine.UI.Button+ButtonClickedEvent"] = function (request, data, root) {
  var i842 = root || request.c( 'UnityEngine.UI.Button+ButtonClickedEvent' )
  var i843 = data
  i842.m_PersistentCalls = request.d('UnityEngine.Events.PersistentCallGroup', i843[0], i842.m_PersistentCalls)
  return i842
}

Deserializers["UnityEngine.Events.PersistentCallGroup"] = function (request, data, root) {
  var i844 = root || request.c( 'UnityEngine.Events.PersistentCallGroup' )
  var i845 = data
  var i847 = i845[0]
  var i846 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.Events.PersistentCall')))
  for(var i = 0; i < i847.length; i += 1) {
    i846.add(request.d('UnityEngine.Events.PersistentCall', i847[i + 0]));
  }
  i844.m_Calls = i846
  return i844
}

Deserializers["UnityEngine.Events.PersistentCall"] = function (request, data, root) {
  var i850 = root || request.c( 'UnityEngine.Events.PersistentCall' )
  var i851 = data
  request.r(i851[0], i851[1], 0, i850, 'm_Target')
  i850.m_TargetAssemblyTypeName = i851[2]
  i850.m_MethodName = i851[3]
  i850.m_Mode = i851[4]
  i850.m_Arguments = request.d('UnityEngine.Events.ArgumentCache', i851[5], i850.m_Arguments)
  i850.m_CallState = i851[6]
  return i850
}

Deserializers["UnityEngine.Events.ArgumentCache"] = function (request, data, root) {
  var i852 = root || request.c( 'UnityEngine.Events.ArgumentCache' )
  var i853 = data
  request.r(i853[0], i853[1], 0, i852, 'm_ObjectArgument')
  i852.m_ObjectArgumentAssemblyTypeName = i853[2]
  i852.m_IntArgument = i853[3]
  i852.m_FloatArgument = i853[4]
  i852.m_StringArgument = i853[5]
  i852.m_BoolArgument = !!i853[6]
  return i852
}

Deserializers["UnityEngine.UI.Navigation"] = function (request, data, root) {
  var i854 = root || request.c( 'UnityEngine.UI.Navigation' )
  var i855 = data
  i854.m_Mode = i855[0]
  i854.m_WrapAround = !!i855[1]
  request.r(i855[2], i855[3], 0, i854, 'm_SelectOnUp')
  request.r(i855[4], i855[5], 0, i854, 'm_SelectOnDown')
  request.r(i855[6], i855[7], 0, i854, 'm_SelectOnLeft')
  request.r(i855[8], i855[9], 0, i854, 'm_SelectOnRight')
  return i854
}

Deserializers["UnityEngine.UI.ColorBlock"] = function (request, data, root) {
  var i856 = root || request.c( 'UnityEngine.UI.ColorBlock' )
  var i857 = data
  i856.m_NormalColor = new pc.Color(i857[0], i857[1], i857[2], i857[3])
  i856.m_HighlightedColor = new pc.Color(i857[4], i857[5], i857[6], i857[7])
  i856.m_PressedColor = new pc.Color(i857[8], i857[9], i857[10], i857[11])
  i856.m_SelectedColor = new pc.Color(i857[12], i857[13], i857[14], i857[15])
  i856.m_DisabledColor = new pc.Color(i857[16], i857[17], i857[18], i857[19])
  i856.m_ColorMultiplier = i857[20]
  i856.m_FadeDuration = i857[21]
  return i856
}

Deserializers["UnityEngine.UI.SpriteState"] = function (request, data, root) {
  var i858 = root || request.c( 'UnityEngine.UI.SpriteState' )
  var i859 = data
  request.r(i859[0], i859[1], 0, i858, 'm_HighlightedSprite')
  request.r(i859[2], i859[3], 0, i858, 'm_PressedSprite')
  request.r(i859[4], i859[5], 0, i858, 'm_SelectedSprite')
  request.r(i859[6], i859[7], 0, i858, 'm_DisabledSprite')
  return i858
}

Deserializers["UnityEngine.UI.AnimationTriggers"] = function (request, data, root) {
  var i860 = root || request.c( 'UnityEngine.UI.AnimationTriggers' )
  var i861 = data
  i860.m_NormalTrigger = i861[0]
  i860.m_HighlightedTrigger = i861[1]
  i860.m_PressedTrigger = i861[2]
  i860.m_SelectedTrigger = i861[3]
  i860.m_DisabledTrigger = i861[4]
  return i860
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.CanvasGroup"] = function (request, data, root) {
  var i862 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.CanvasGroup' )
  var i863 = data
  i862.m_Alpha = i863[0]
  i862.m_Interactable = !!i863[1]
  i862.m_BlocksRaycasts = !!i863[2]
  i862.m_IgnoreParentGroups = !!i863[3]
  i862.enabled = !!i863[4]
  return i862
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Animator"] = function (request, data, root) {
  var i864 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Animator' )
  var i865 = data
  request.r(i865[0], i865[1], 0, i864, 'animatorController')
  request.r(i865[2], i865[3], 0, i864, 'avatar')
  i864.updateMode = i865[4]
  i864.hasTransformHierarchy = !!i865[5]
  i864.applyRootMotion = !!i865[6]
  var i867 = i865[7]
  var i866 = []
  for(var i = 0; i < i867.length; i += 2) {
  request.r(i867[i + 0], i867[i + 1], 2, i866, '')
  }
  i864.humanBones = i866
  i864.enabled = !!i865[8]
  return i864
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.ParticleSystem"] = function (request, data, root) {
  var i870 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.ParticleSystem' )
  var i871 = data
  i870.main = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.MainModule', i871[0], i870.main)
  i870.colorBySpeed = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ColorBySpeedModule', i871[1], i870.colorBySpeed)
  i870.colorOverLifetime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ColorOverLifetimeModule', i871[2], i870.colorOverLifetime)
  i870.emission = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.EmissionModule', i871[3], i870.emission)
  i870.rotationBySpeed = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.RotationBySpeedModule', i871[4], i870.rotationBySpeed)
  i870.rotationOverLifetime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.RotationOverLifetimeModule', i871[5], i870.rotationOverLifetime)
  i870.shape = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ShapeModule', i871[6], i870.shape)
  i870.sizeBySpeed = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.SizeBySpeedModule', i871[7], i870.sizeBySpeed)
  i870.sizeOverLifetime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.SizeOverLifetimeModule', i871[8], i870.sizeOverLifetime)
  i870.textureSheetAnimation = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.TextureSheetAnimationModule', i871[9], i870.textureSheetAnimation)
  i870.velocityOverLifetime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.VelocityOverLifetimeModule', i871[10], i870.velocityOverLifetime)
  i870.noise = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.NoiseModule', i871[11], i870.noise)
  i870.inheritVelocity = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.InheritVelocityModule', i871[12], i870.inheritVelocity)
  i870.forceOverLifetime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ForceOverLifetimeModule', i871[13], i870.forceOverLifetime)
  i870.limitVelocityOverLifetime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemModules.LimitVelocityOverLifetimeModule', i871[14], i870.limitVelocityOverLifetime)
  i870.useAutoRandomSeed = !!i871[15]
  i870.randomSeed = i871[16]
  return i870
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.MainModule"] = function (request, data, root) {
  var i872 = root || new pc.ParticleSystemMain()
  var i873 = data
  i872.duration = i873[0]
  i872.loop = !!i873[1]
  i872.prewarm = !!i873[2]
  i872.startDelay = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[3], i872.startDelay)
  i872.startLifetime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[4], i872.startLifetime)
  i872.startSpeed = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[5], i872.startSpeed)
  i872.startSize3D = !!i873[6]
  i872.startSizeX = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[7], i872.startSizeX)
  i872.startSizeY = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[8], i872.startSizeY)
  i872.startSizeZ = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[9], i872.startSizeZ)
  i872.startRotation3D = !!i873[10]
  i872.startRotationX = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[11], i872.startRotationX)
  i872.startRotationY = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[12], i872.startRotationY)
  i872.startRotationZ = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[13], i872.startRotationZ)
  i872.startColor = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxGradient', i873[14], i872.startColor)
  i872.gravityModifier = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i873[15], i872.gravityModifier)
  i872.simulationSpace = i873[16]
  request.r(i873[17], i873[18], 0, i872, 'customSimulationSpace')
  i872.simulationSpeed = i873[19]
  i872.useUnscaledTime = !!i873[20]
  i872.scalingMode = i873[21]
  i872.playOnAwake = !!i873[22]
  i872.maxParticles = i873[23]
  i872.emitterVelocityMode = i873[24]
  i872.stopAction = i873[25]
  return i872
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve"] = function (request, data, root) {
  var i874 = root || new pc.MinMaxCurve()
  var i875 = data
  i874.mode = i875[0]
  i874.curveMin = new pc.AnimationCurve( { keys_flow: i875[1] } )
  i874.curveMax = new pc.AnimationCurve( { keys_flow: i875[2] } )
  i874.curveMultiplier = i875[3]
  i874.constantMin = i875[4]
  i874.constantMax = i875[5]
  return i874
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxGradient"] = function (request, data, root) {
  var i876 = root || new pc.MinMaxGradient()
  var i877 = data
  i876.mode = i877[0]
  i876.gradientMin = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Gradient', i877[1], i876.gradientMin)
  i876.gradientMax = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Gradient', i877[2], i876.gradientMax)
  i876.colorMin = new pc.Color(i877[3], i877[4], i877[5], i877[6])
  i876.colorMax = new pc.Color(i877[7], i877[8], i877[9], i877[10])
  return i876
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Gradient"] = function (request, data, root) {
  var i878 = root || request.c( 'Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Gradient' )
  var i879 = data
  i878.mode = i879[0]
  var i881 = i879[1]
  var i880 = []
  for(var i = 0; i < i881.length; i += 1) {
    i880.push( request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Data.GradientColorKey', i881[i + 0]) );
  }
  i878.colorKeys = i880
  var i883 = i879[2]
  var i882 = []
  for(var i = 0; i < i883.length; i += 1) {
    i882.push( request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Data.GradientAlphaKey', i883[i + 0]) );
  }
  i878.alphaKeys = i882
  return i878
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ColorBySpeedModule"] = function (request, data, root) {
  var i884 = root || new pc.ParticleSystemColorBySpeed()
  var i885 = data
  i884.enabled = !!i885[0]
  i884.color = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxGradient', i885[1], i884.color)
  i884.range = new pc.Vec2( i885[2], i885[3] )
  return i884
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Data.GradientColorKey"] = function (request, data, root) {
  var i888 = root || request.c( 'Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Data.GradientColorKey' )
  var i889 = data
  i888.color = new pc.Color(i889[0], i889[1], i889[2], i889[3])
  i888.time = i889[4]
  return i888
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Data.GradientAlphaKey"] = function (request, data, root) {
  var i892 = root || request.c( 'Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Data.GradientAlphaKey' )
  var i893 = data
  i892.alpha = i893[0]
  i892.time = i893[1]
  return i892
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ColorOverLifetimeModule"] = function (request, data, root) {
  var i894 = root || new pc.ParticleSystemColorOverLifetime()
  var i895 = data
  i894.enabled = !!i895[0]
  i894.color = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxGradient', i895[1], i894.color)
  return i894
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.EmissionModule"] = function (request, data, root) {
  var i896 = root || new pc.ParticleSystemEmitter()
  var i897 = data
  i896.enabled = !!i897[0]
  i896.rateOverTime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i897[1], i896.rateOverTime)
  i896.rateOverDistance = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i897[2], i896.rateOverDistance)
  var i899 = i897[3]
  var i898 = []
  for(var i = 0; i < i899.length; i += 1) {
    i898.push( request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Burst', i899[i + 0]) );
  }
  i896.bursts = i898
  return i896
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Burst"] = function (request, data, root) {
  var i902 = root || new pc.ParticleSystemBurst()
  var i903 = data
  i902.count = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i903[0], i902.count)
  i902.cycleCount = i903[1]
  i902.minCount = i903[2]
  i902.maxCount = i903[3]
  i902.repeatInterval = i903[4]
  i902.time = i903[5]
  return i902
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.RotationBySpeedModule"] = function (request, data, root) {
  var i904 = root || new pc.ParticleSystemRotationBySpeed()
  var i905 = data
  i904.enabled = !!i905[0]
  i904.x = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i905[1], i904.x)
  i904.y = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i905[2], i904.y)
  i904.z = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i905[3], i904.z)
  i904.separateAxes = !!i905[4]
  i904.range = new pc.Vec2( i905[5], i905[6] )
  return i904
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.RotationOverLifetimeModule"] = function (request, data, root) {
  var i906 = root || new pc.ParticleSystemRotationOverLifetime()
  var i907 = data
  i906.enabled = !!i907[0]
  i906.x = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i907[1], i906.x)
  i906.y = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i907[2], i906.y)
  i906.z = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i907[3], i906.z)
  i906.separateAxes = !!i907[4]
  return i906
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ShapeModule"] = function (request, data, root) {
  var i908 = root || new pc.ParticleSystemShape()
  var i909 = data
  i908.enabled = !!i909[0]
  i908.shapeType = i909[1]
  i908.randomDirectionAmount = i909[2]
  i908.sphericalDirectionAmount = i909[3]
  i908.randomPositionAmount = i909[4]
  i908.alignToDirection = !!i909[5]
  i908.radius = i909[6]
  i908.radiusMode = i909[7]
  i908.radiusSpread = i909[8]
  i908.radiusSpeed = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i909[9], i908.radiusSpeed)
  i908.radiusThickness = i909[10]
  i908.angle = i909[11]
  i908.length = i909[12]
  i908.boxThickness = new pc.Vec3( i909[13], i909[14], i909[15] )
  i908.meshShapeType = i909[16]
  request.r(i909[17], i909[18], 0, i908, 'mesh')
  request.r(i909[19], i909[20], 0, i908, 'meshRenderer')
  request.r(i909[21], i909[22], 0, i908, 'skinnedMeshRenderer')
  i908.useMeshMaterialIndex = !!i909[23]
  i908.meshMaterialIndex = i909[24]
  i908.useMeshColors = !!i909[25]
  i908.normalOffset = i909[26]
  i908.arc = i909[27]
  i908.arcMode = i909[28]
  i908.arcSpread = i909[29]
  i908.arcSpeed = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i909[30], i908.arcSpeed)
  i908.donutRadius = i909[31]
  i908.position = new pc.Vec3( i909[32], i909[33], i909[34] )
  i908.rotation = new pc.Vec3( i909[35], i909[36], i909[37] )
  i908.scale = new pc.Vec3( i909[38], i909[39], i909[40] )
  return i908
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.SizeBySpeedModule"] = function (request, data, root) {
  var i910 = root || new pc.ParticleSystemSizeBySpeed()
  var i911 = data
  i910.enabled = !!i911[0]
  i910.x = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i911[1], i910.x)
  i910.y = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i911[2], i910.y)
  i910.z = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i911[3], i910.z)
  i910.separateAxes = !!i911[4]
  i910.range = new pc.Vec2( i911[5], i911[6] )
  return i910
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.SizeOverLifetimeModule"] = function (request, data, root) {
  var i912 = root || new pc.ParticleSystemSizeOverLifetime()
  var i913 = data
  i912.enabled = !!i913[0]
  i912.x = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i913[1], i912.x)
  i912.y = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i913[2], i912.y)
  i912.z = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i913[3], i912.z)
  i912.separateAxes = !!i913[4]
  return i912
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.TextureSheetAnimationModule"] = function (request, data, root) {
  var i914 = root || new pc.ParticleSystemTextureSheetAnimation()
  var i915 = data
  i914.enabled = !!i915[0]
  i914.mode = i915[1]
  i914.animation = i915[2]
  i914.numTilesX = i915[3]
  i914.numTilesY = i915[4]
  i914.useRandomRow = !!i915[5]
  i914.frameOverTime = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i915[6], i914.frameOverTime)
  i914.startFrame = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i915[7], i914.startFrame)
  i914.cycleCount = i915[8]
  i914.rowIndex = i915[9]
  i914.flipU = i915[10]
  i914.flipV = i915[11]
  i914.spriteCount = i915[12]
  var i917 = i915[13]
  var i916 = []
  for(var i = 0; i < i917.length; i += 2) {
  request.r(i917[i + 0], i917[i + 1], 2, i916, '')
  }
  i914.sprites = i916
  return i914
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.VelocityOverLifetimeModule"] = function (request, data, root) {
  var i920 = root || new pc.ParticleSystemVelocityOverLifetime()
  var i921 = data
  i920.enabled = !!i921[0]
  i920.x = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[1], i920.x)
  i920.y = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[2], i920.y)
  i920.z = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[3], i920.z)
  i920.radial = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[4], i920.radial)
  i920.speedModifier = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[5], i920.speedModifier)
  i920.space = i921[6]
  i920.orbitalX = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[7], i920.orbitalX)
  i920.orbitalY = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[8], i920.orbitalY)
  i920.orbitalZ = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[9], i920.orbitalZ)
  i920.orbitalOffsetX = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[10], i920.orbitalOffsetX)
  i920.orbitalOffsetY = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[11], i920.orbitalOffsetY)
  i920.orbitalOffsetZ = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i921[12], i920.orbitalOffsetZ)
  return i920
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.NoiseModule"] = function (request, data, root) {
  var i922 = root || new pc.ParticleSystemNoise()
  var i923 = data
  i922.enabled = !!i923[0]
  i922.separateAxes = !!i923[1]
  i922.strengthX = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[2], i922.strengthX)
  i922.strengthY = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[3], i922.strengthY)
  i922.strengthZ = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[4], i922.strengthZ)
  i922.frequency = i923[5]
  i922.damping = !!i923[6]
  i922.octaveCount = i923[7]
  i922.octaveMultiplier = i923[8]
  i922.octaveScale = i923[9]
  i922.quality = i923[10]
  i922.scrollSpeed = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[11], i922.scrollSpeed)
  i922.scrollSpeedMultiplier = i923[12]
  i922.remapEnabled = !!i923[13]
  i922.remapX = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[14], i922.remapX)
  i922.remapY = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[15], i922.remapY)
  i922.remapZ = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[16], i922.remapZ)
  i922.positionAmount = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[17], i922.positionAmount)
  i922.rotationAmount = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[18], i922.rotationAmount)
  i922.sizeAmount = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i923[19], i922.sizeAmount)
  return i922
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.InheritVelocityModule"] = function (request, data, root) {
  var i924 = root || new pc.ParticleSystemInheritVelocity()
  var i925 = data
  i924.enabled = !!i925[0]
  i924.mode = i925[1]
  i924.curve = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i925[2], i924.curve)
  return i924
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ForceOverLifetimeModule"] = function (request, data, root) {
  var i926 = root || new pc.ParticleSystemForceOverLifetime()
  var i927 = data
  i926.enabled = !!i927[0]
  i926.x = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i927[1], i926.x)
  i926.y = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i927[2], i926.y)
  i926.z = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i927[3], i926.z)
  i926.space = i927[4]
  i926.randomized = !!i927[5]
  return i926
}

Deserializers["Luna.Unity.DTO.UnityEngine.ParticleSystemModules.LimitVelocityOverLifetimeModule"] = function (request, data, root) {
  var i928 = root || new pc.ParticleSystemLimitVelocityOverLifetime()
  var i929 = data
  i928.enabled = !!i929[0]
  i928.limit = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i929[1], i928.limit)
  i928.limitX = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i929[2], i928.limitX)
  i928.limitY = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i929[3], i928.limitY)
  i928.limitZ = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i929[4], i928.limitZ)
  i928.dampen = i929[5]
  i928.separateAxes = !!i929[6]
  i928.space = i929[7]
  i928.drag = request.d('Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve', i929[8], i928.drag)
  i928.multiplyDragByParticleSize = !!i929[9]
  i928.multiplyDragByParticleVelocity = !!i929[10]
  return i928
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.ParticleSystemRenderer"] = function (request, data, root) {
  var i930 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.ParticleSystemRenderer' )
  var i931 = data
  request.r(i931[0], i931[1], 0, i930, 'mesh')
  i930.meshCount = i931[2]
  i930.activeVertexStreamsCount = i931[3]
  i930.alignment = i931[4]
  i930.renderMode = i931[5]
  i930.sortMode = i931[6]
  i930.lengthScale = i931[7]
  i930.velocityScale = i931[8]
  i930.cameraVelocityScale = i931[9]
  i930.normalDirection = i931[10]
  i930.sortingFudge = i931[11]
  i930.minParticleSize = i931[12]
  i930.maxParticleSize = i931[13]
  i930.pivot = new pc.Vec3( i931[14], i931[15], i931[16] )
  request.r(i931[17], i931[18], 0, i930, 'trailMaterial')
  i930.applyActiveColorSpace = !!i931[19]
  i930.enabled = !!i931[20]
  request.r(i931[21], i931[22], 0, i930, 'sharedMaterial')
  var i933 = i931[23]
  var i932 = []
  for(var i = 0; i < i933.length; i += 2) {
  request.r(i933[i + 0], i933[i + 1], 2, i932, '')
  }
  i930.sharedMaterials = i932
  i930.receiveShadows = !!i931[24]
  i930.shadowCastingMode = i931[25]
  i930.sortingLayerID = i931[26]
  i930.sortingOrder = i931[27]
  i930.lightmapIndex = i931[28]
  i930.lightmapSceneIndex = i931[29]
  i930.lightmapScaleOffset = new pc.Vec4( i931[30], i931[31], i931[32], i931[33] )
  i930.lightProbeUsage = i931[34]
  i930.reflectionProbeUsage = i931[35]
  return i930
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.BoxCollider"] = function (request, data, root) {
  var i934 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.BoxCollider' )
  var i935 = data
  i934.center = new pc.Vec3( i935[0], i935[1], i935[2] )
  i934.size = new pc.Vec3( i935[3], i935[4], i935[5] )
  i934.enabled = !!i935[6]
  i934.isTrigger = !!i935[7]
  request.r(i935[8], i935[9], 0, i934, 'material')
  return i934
}

Deserializers["GridSlot"] = function (request, data, root) {
  var i936 = root || request.c( 'GridSlot' )
  var i937 = data
  request.r(i937[0], i937[1], 0, i936, 'occupyingBrick')
  i936.brickLayer = UnityEngine.LayerMask.FromIntegerValue( i937[2] )
  i936.checkBoxSize = new pc.Vec3( i937[3], i937[4], i937[5] )
  return i936
}

Deserializers["Gate"] = function (request, data, root) {
  var i938 = root || request.c( 'Gate' )
  var i939 = data
  i938.gateColor = new pc.Color(i939[0], i939[1], i939[2], i939[3])
  var i941 = i939[4]
  var i940 = new (System.Collections.Generic.List$1(Bridge.ns('GridSlot')))
  for(var i = 0; i < i941.length; i += 2) {
  request.r(i941[i + 0], i941[i + 1], 1, i940, '')
  }
  i938.gateSlots = i940
  i938.GridSlotLayer = UnityEngine.LayerMask.FromIntegerValue( i939[5] )
  i938.boxSize = new pc.Vec3( i939[6], i939[7], i939[8] )
  i938.boxPosition = new pc.Vec3( i939[9], i939[10], i939[11] )
  i938.acceptDirection = new pc.Vec3( i939[12], i939[13], i939[14] )
  request.r(i939[15], i939[16], 0, i938, 'gate')
  var i943 = i939[17]
  var i942 = []
  for(var i = 0; i < i943.length; i += 2) {
  request.r(i943[i + 0], i943[i + 1], 2, i942, '')
  }
  i938.vfxs = i942
  return i938
}

Deserializers["Brick"] = function (request, data, root) {
  var i946 = root || request.c( 'Brick' )
  var i947 = data
  i946.BrickColor = i947[0]
  i946.brickColor = new pc.Color(i947[1], i947[2], i947[3], i947[4])
  i946.blockingLayers = UnityEngine.LayerMask.FromIntegerValue( i947[5] )
  i946.gateBlockingLayers = UnityEngine.LayerMask.FromIntegerValue( i947[6] )
  i946.blockCheckCells = i947[7]
  i946.followSpeed = i947[8]
  i946.maxDragStep = i947[9]
  i946.snapDuration = i947[10]
  i946.snapBackDuration = i947[11]
  request.r(i947[12], i947[13], 0, i946, 'brickMesh')
  request.r(i947[14], i947[15], 0, i946, 'highlight')
  return i946
}

Deserializers["Luna.Unity.DTO.UnityEngine.Components.Rigidbody"] = function (request, data, root) {
  var i948 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Components.Rigidbody' )
  var i949 = data
  i948.mass = i949[0]
  i948.drag = i949[1]
  i948.angularDrag = i949[2]
  i948.useGravity = !!i949[3]
  i948.isKinematic = !!i949[4]
  i948.constraints = i949[5]
  i948.maxAngularVelocity = i949[6]
  i948.collisionDetectionMode = i949[7]
  i948.interpolation = i949[8]
  return i948
}

Deserializers["BrickCell"] = function (request, data, root) {
  var i950 = root || request.c( 'BrickCell' )
  var i951 = data
  i950.localGridPosition = new pc.Vec2( i951[0], i951[1] )
  return i950
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings"] = function (request, data, root) {
  var i952 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderSettings' )
  var i953 = data
  i952.ambientIntensity = i953[0]
  i952.reflectionIntensity = i953[1]
  i952.ambientMode = i953[2]
  i952.ambientLight = new pc.Color(i953[3], i953[4], i953[5], i953[6])
  i952.ambientSkyColor = new pc.Color(i953[7], i953[8], i953[9], i953[10])
  i952.ambientGroundColor = new pc.Color(i953[11], i953[12], i953[13], i953[14])
  i952.ambientEquatorColor = new pc.Color(i953[15], i953[16], i953[17], i953[18])
  i952.fogColor = new pc.Color(i953[19], i953[20], i953[21], i953[22])
  i952.fogEndDistance = i953[23]
  i952.fogStartDistance = i953[24]
  i952.fogDensity = i953[25]
  i952.fog = !!i953[26]
  request.r(i953[27], i953[28], 0, i952, 'skybox')
  i952.fogMode = i953[29]
  var i955 = i953[30]
  var i954 = []
  for(var i = 0; i < i955.length; i += 1) {
    i954.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap', i955[i + 0]) );
  }
  i952.lightmaps = i954
  i952.lightProbes = request.d('Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes', i953[31], i952.lightProbes)
  i952.lightmapsMode = i953[32]
  i952.mixedBakeMode = i953[33]
  i952.environmentLightingMode = i953[34]
  i952.ambientProbe = new pc.SphericalHarmonicsL2(i953[35])
  request.r(i953[36], i953[37], 0, i952, 'customReflection')
  request.r(i953[38], i953[39], 0, i952, 'defaultReflection')
  i952.defaultReflectionMode = i953[40]
  i952.defaultReflectionResolution = i953[41]
  i952.sunLightObjectId = i953[42]
  i952.pixelLightCount = i953[43]
  i952.defaultReflectionHDR = !!i953[44]
  i952.hasLightDataAsset = !!i953[45]
  i952.hasManualGenerate = !!i953[46]
  return i952
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap"] = function (request, data, root) {
  var i958 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap' )
  var i959 = data
  request.r(i959[0], i959[1], 0, i958, 'lightmapColor')
  request.r(i959[2], i959[3], 0, i958, 'lightmapDirection')
  request.r(i959[4], i959[5], 0, i958, 'shadowMask')
  return i958
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes"] = function (request, data, root) {
  var i960 = root || new UnityEngine.LightProbes()
  var i961 = data
  return i960
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader"] = function (request, data, root) {
  var i968 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader' )
  var i969 = data
  var i971 = i969[0]
  var i970 = new (System.Collections.Generic.List$1(Bridge.ns('Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError')))
  for(var i = 0; i < i971.length; i += 1) {
    i970.add(request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError', i971[i + 0]));
  }
  i968.ShaderCompilationErrors = i970
  i968.name = i969[1]
  i968.guid = i969[2]
  var i973 = i969[3]
  var i972 = []
  for(var i = 0; i < i973.length; i += 1) {
    i972.push( i973[i + 0] );
  }
  i968.shaderDefinedKeywords = i972
  var i975 = i969[4]
  var i974 = []
  for(var i = 0; i < i975.length; i += 1) {
    i974.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass', i975[i + 0]) );
  }
  i968.passes = i974
  var i977 = i969[5]
  var i976 = []
  for(var i = 0; i < i977.length; i += 1) {
    i976.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass', i977[i + 0]) );
  }
  i968.usePasses = i976
  var i979 = i969[6]
  var i978 = []
  for(var i = 0; i < i979.length; i += 1) {
    i978.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue', i979[i + 0]) );
  }
  i968.defaultParameterValues = i978
  request.r(i969[7], i969[8], 0, i968, 'unityFallbackShader')
  i968.readDepth = !!i969[9]
  i968.hasDepthOnlyPass = !!i969[10]
  i968.isCreatedByShaderGraph = !!i969[11]
  i968.disableBatching = !!i969[12]
  i968.compiled = !!i969[13]
  return i968
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError"] = function (request, data, root) {
  var i982 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError' )
  var i983 = data
  i982.shaderName = i983[0]
  i982.errorMessage = i983[1]
  return i982
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass"] = function (request, data, root) {
  var i988 = root || new pc.UnityShaderPass()
  var i989 = data
  i988.id = i989[0]
  i988.subShaderIndex = i989[1]
  i988.name = i989[2]
  i988.passType = i989[3]
  i988.grabPassTextureName = i989[4]
  i988.usePass = !!i989[5]
  i988.zTest = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[6], i988.zTest)
  i988.zWrite = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[7], i988.zWrite)
  i988.culling = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[8], i988.culling)
  i988.blending = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending', i989[9], i988.blending)
  i988.alphaBlending = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending', i989[10], i988.alphaBlending)
  i988.colorWriteMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[11], i988.colorWriteMask)
  i988.offsetUnits = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[12], i988.offsetUnits)
  i988.offsetFactor = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[13], i988.offsetFactor)
  i988.stencilRef = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[14], i988.stencilRef)
  i988.stencilReadMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[15], i988.stencilReadMask)
  i988.stencilWriteMask = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i989[16], i988.stencilWriteMask)
  i988.stencilOp = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i989[17], i988.stencilOp)
  i988.stencilOpFront = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i989[18], i988.stencilOpFront)
  i988.stencilOpBack = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp', i989[19], i988.stencilOpBack)
  var i991 = i989[20]
  var i990 = []
  for(var i = 0; i < i991.length; i += 1) {
    i990.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag', i991[i + 0]) );
  }
  i988.tags = i990
  var i993 = i989[21]
  var i992 = []
  for(var i = 0; i < i993.length; i += 1) {
    i992.push( i993[i + 0] );
  }
  i988.passDefinedKeywords = i992
  var i995 = i989[22]
  var i994 = []
  for(var i = 0; i < i995.length; i += 1) {
    i994.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup', i995[i + 0]) );
  }
  i988.passDefinedKeywordGroups = i994
  var i997 = i989[23]
  var i996 = []
  for(var i = 0; i < i997.length; i += 1) {
    i996.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant', i997[i + 0]) );
  }
  i988.variants = i996
  var i999 = i989[24]
  var i998 = []
  for(var i = 0; i < i999.length; i += 1) {
    i998.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant', i999[i + 0]) );
  }
  i988.excludedVariants = i998
  i988.hasDepthReader = !!i989[25]
  return i988
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value"] = function (request, data, root) {
  var i1000 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value' )
  var i1001 = data
  i1000.val = i1001[0]
  i1000.name = i1001[1]
  return i1000
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending"] = function (request, data, root) {
  var i1002 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending' )
  var i1003 = data
  i1002.src = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i1003[0], i1002.src)
  i1002.dst = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i1003[1], i1002.dst)
  i1002.op = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i1003[2], i1002.op)
  return i1002
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp"] = function (request, data, root) {
  var i1004 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp' )
  var i1005 = data
  i1004.pass = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i1005[0], i1004.pass)
  i1004.fail = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i1005[1], i1004.fail)
  i1004.zFail = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i1005[2], i1004.zFail)
  i1004.comp = request.d('Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value', i1005[3], i1004.comp)
  return i1004
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag"] = function (request, data, root) {
  var i1008 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag' )
  var i1009 = data
  i1008.name = i1009[0]
  i1008.value = i1009[1]
  return i1008
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup"] = function (request, data, root) {
  var i1012 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup' )
  var i1013 = data
  var i1015 = i1013[0]
  var i1014 = []
  for(var i = 0; i < i1015.length; i += 1) {
    i1014.push( i1015[i + 0] );
  }
  i1012.keywords = i1014
  i1012.hasDiscard = !!i1013[1]
  return i1012
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant"] = function (request, data, root) {
  var i1018 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant' )
  var i1019 = data
  i1018.passId = i1019[0]
  i1018.subShaderIndex = i1019[1]
  var i1021 = i1019[2]
  var i1020 = []
  for(var i = 0; i < i1021.length; i += 1) {
    i1020.push( i1021[i + 0] );
  }
  i1018.keywords = i1020
  i1018.vertexProgram = i1019[3]
  i1018.fragmentProgram = i1019[4]
  i1018.exportedForWebGl2 = !!i1019[5]
  i1018.readDepth = !!i1019[6]
  return i1018
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass"] = function (request, data, root) {
  var i1024 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass' )
  var i1025 = data
  request.r(i1025[0], i1025[1], 0, i1024, 'shader')
  i1024.pass = i1025[2]
  return i1024
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue"] = function (request, data, root) {
  var i1028 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue' )
  var i1029 = data
  i1028.name = i1029[0]
  i1028.type = i1029[1]
  i1028.value = new pc.Vec4( i1029[2], i1029[3], i1029[4], i1029[5] )
  i1028.textureValue = i1029[6]
  i1028.shaderPropertyFlag = i1029[7]
  return i1028
}

Deserializers["Luna.Unity.DTO.UnityEngine.Textures.Sprite"] = function (request, data, root) {
  var i1030 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Textures.Sprite' )
  var i1031 = data
  i1030.name = i1031[0]
  request.r(i1031[1], i1031[2], 0, i1030, 'texture')
  i1030.aabb = i1031[3]
  i1030.vertices = i1031[4]
  i1030.triangles = i1031[5]
  i1030.textureRect = UnityEngine.Rect.MinMaxRect(i1031[6], i1031[7], i1031[8], i1031[9])
  i1030.packedRect = UnityEngine.Rect.MinMaxRect(i1031[10], i1031[11], i1031[12], i1031[13])
  i1030.border = new pc.Vec4( i1031[14], i1031[15], i1031[16], i1031[17] )
  i1030.transparency = i1031[18]
  i1030.bounds = i1031[19]
  i1030.pixelsPerUnit = i1031[20]
  i1030.textureWidth = i1031[21]
  i1030.textureHeight = i1031[22]
  i1030.nativeSize = new pc.Vec2( i1031[23], i1031[24] )
  i1030.pivot = new pc.Vec2( i1031[25], i1031[26] )
  i1030.textureRectOffset = new pc.Vec2( i1031[27], i1031[28] )
  return i1030
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.AudioClip"] = function (request, data, root) {
  var i1032 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.AudioClip' )
  var i1033 = data
  i1032.name = i1033[0]
  return i1032
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationClip"] = function (request, data, root) {
  var i1034 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationClip' )
  var i1035 = data
  i1034.name = i1035[0]
  i1034.wrapMode = i1035[1]
  i1034.isLooping = !!i1035[2]
  i1034.length = i1035[3]
  var i1037 = i1035[4]
  var i1036 = []
  for(var i = 0; i < i1037.length; i += 1) {
    i1036.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationCurve', i1037[i + 0]) );
  }
  i1034.curves = i1036
  var i1039 = i1035[5]
  var i1038 = []
  for(var i = 0; i < i1039.length; i += 1) {
    i1038.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationEvent', i1039[i + 0]) );
  }
  i1034.events = i1038
  i1034.halfPrecision = !!i1035[6]
  i1034._frameRate = i1035[7]
  i1034.localBounds = request.d('Luna.Unity.DTO.UnityEngine.Animation.Data.Bounds', i1035[8], i1034.localBounds)
  i1034.hasMuscleCurves = !!i1035[9]
  var i1041 = i1035[10]
  var i1040 = []
  for(var i = 0; i < i1041.length; i += 1) {
    i1040.push( i1041[i + 0] );
  }
  i1034.clipMuscleConstant = i1040
  i1034.clipBindingConstant = request.d('Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationClip+AnimationClipBindingConstant', i1035[11], i1034.clipBindingConstant)
  return i1034
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationCurve"] = function (request, data, root) {
  var i1044 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationCurve' )
  var i1045 = data
  i1044.path = i1045[0]
  i1044.hash = i1045[1]
  i1044.componentType = i1045[2]
  i1044.property = i1045[3]
  i1044.keys = i1045[4]
  var i1047 = i1045[5]
  var i1046 = []
  for(var i = 0; i < i1047.length; i += 1) {
    i1046.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationCurve+ObjectReferenceKey', i1047[i + 0]) );
  }
  i1044.objectReferenceKeys = i1046
  return i1044
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationCurve+ObjectReferenceKey"] = function (request, data, root) {
  var i1050 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationCurve+ObjectReferenceKey' )
  var i1051 = data
  i1050.time = i1051[0]
  request.r(i1051[1], i1051[2], 0, i1050, 'value')
  return i1050
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationEvent"] = function (request, data, root) {
  var i1054 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationEvent' )
  var i1055 = data
  i1054.functionName = i1055[0]
  i1054.floatParameter = i1055[1]
  i1054.intParameter = i1055[2]
  i1054.stringParameter = i1055[3]
  request.r(i1055[4], i1055[5], 0, i1054, 'objectReferenceParameter')
  i1054.time = i1055[6]
  return i1054
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Data.Bounds"] = function (request, data, root) {
  var i1056 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Data.Bounds' )
  var i1057 = data
  i1056.center = new pc.Vec3( i1057[0], i1057[1], i1057[2] )
  i1056.extends = new pc.Vec3( i1057[3], i1057[4], i1057[5] )
  return i1056
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationClip+AnimationClipBindingConstant"] = function (request, data, root) {
  var i1060 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationClip+AnimationClipBindingConstant' )
  var i1061 = data
  var i1063 = i1061[0]
  var i1062 = []
  for(var i = 0; i < i1063.length; i += 1) {
    i1062.push( i1063[i + 0] );
  }
  i1060.genericBindings = i1062
  var i1065 = i1061[1]
  var i1064 = []
  for(var i = 0; i < i1065.length; i += 1) {
    i1064.push( i1065[i + 0] );
  }
  i1060.pptrCurveMapping = i1064
  return i1060
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Font"] = function (request, data, root) {
  var i1066 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Font' )
  var i1067 = data
  i1066.name = i1067[0]
  i1066.ascent = i1067[1]
  i1066.originalLineHeight = i1067[2]
  i1066.fontSize = i1067[3]
  var i1069 = i1067[4]
  var i1068 = []
  for(var i = 0; i < i1069.length; i += 1) {
    i1068.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo', i1069[i + 0]) );
  }
  i1066.characterInfo = i1068
  request.r(i1067[5], i1067[6], 0, i1066, 'texture')
  i1066.originalFontSize = i1067[7]
  return i1066
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo"] = function (request, data, root) {
  var i1072 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo' )
  var i1073 = data
  i1072.index = i1073[0]
  i1072.advance = i1073[1]
  i1072.bearing = i1073[2]
  i1072.glyphWidth = i1073[3]
  i1072.glyphHeight = i1073[4]
  i1072.minX = i1073[5]
  i1072.maxX = i1073[6]
  i1072.minY = i1073[7]
  i1072.maxY = i1073[8]
  i1072.uvBottomLeftX = i1073[9]
  i1072.uvBottomLeftY = i1073[10]
  i1072.uvBottomRightX = i1073[11]
  i1072.uvBottomRightY = i1073[12]
  i1072.uvTopLeftX = i1073[13]
  i1072.uvTopLeftY = i1073[14]
  i1072.uvTopRightX = i1073[15]
  i1072.uvTopRightY = i1073[16]
  return i1072
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorController"] = function (request, data, root) {
  var i1074 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorController' )
  var i1075 = data
  i1074.name = i1075[0]
  var i1077 = i1075[1]
  var i1076 = []
  for(var i = 0; i < i1077.length; i += 1) {
    i1076.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorControllerLayer', i1077[i + 0]) );
  }
  i1074.layers = i1076
  var i1079 = i1075[2]
  var i1078 = []
  for(var i = 0; i < i1079.length; i += 1) {
    i1078.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorControllerParameter', i1079[i + 0]) );
  }
  i1074.parameters = i1078
  i1074.animationClips = i1075[3]
  i1074.avatarUnsupported = i1075[4]
  return i1074
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorControllerLayer"] = function (request, data, root) {
  var i1082 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorControllerLayer' )
  var i1083 = data
  i1082.name = i1083[0]
  i1082.defaultWeight = i1083[1]
  i1082.blendingMode = i1083[2]
  i1082.avatarMask = i1083[3]
  i1082.syncedLayerIndex = i1083[4]
  i1082.syncedLayerAffectsTiming = !!i1083[5]
  i1082.syncedLayers = i1083[6]
  i1082.stateMachine = request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateMachine', i1083[7], i1082.stateMachine)
  return i1082
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateMachine"] = function (request, data, root) {
  var i1084 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateMachine' )
  var i1085 = data
  i1084.id = i1085[0]
  i1084.name = i1085[1]
  i1084.path = i1085[2]
  var i1087 = i1085[3]
  var i1086 = []
  for(var i = 0; i < i1087.length; i += 1) {
    i1086.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorState', i1087[i + 0]) );
  }
  i1084.states = i1086
  var i1089 = i1085[4]
  var i1088 = []
  for(var i = 0; i < i1089.length; i += 1) {
    i1088.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateMachine', i1089[i + 0]) );
  }
  i1084.machines = i1088
  var i1091 = i1085[5]
  var i1090 = []
  for(var i = 0; i < i1091.length; i += 1) {
    i1090.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorTransition', i1091[i + 0]) );
  }
  i1084.entryStateTransitions = i1090
  var i1093 = i1085[6]
  var i1092 = []
  for(var i = 0; i < i1093.length; i += 1) {
    i1092.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorTransition', i1093[i + 0]) );
  }
  i1084.exitStateTransitions = i1092
  var i1095 = i1085[7]
  var i1094 = []
  for(var i = 0; i < i1095.length; i += 1) {
    i1094.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateTransition', i1095[i + 0]) );
  }
  i1084.anyStateTransitions = i1094
  i1084.defaultStateId = i1085[8]
  return i1084
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorState"] = function (request, data, root) {
  var i1098 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorState' )
  var i1099 = data
  i1098.id = i1099[0]
  i1098.name = i1099[1]
  i1098.cycleOffset = i1099[2]
  i1098.cycleOffsetParameter = i1099[3]
  i1098.cycleOffsetParameterActive = !!i1099[4]
  i1098.mirror = !!i1099[5]
  i1098.mirrorParameter = i1099[6]
  i1098.mirrorParameterActive = !!i1099[7]
  i1098.motionId = i1099[8]
  i1098.nameHash = i1099[9]
  i1098.fullPathHash = i1099[10]
  i1098.speed = i1099[11]
  i1098.speedParameter = i1099[12]
  i1098.speedParameterActive = !!i1099[13]
  i1098.tag = i1099[14]
  i1098.tagHash = i1099[15]
  i1098.writeDefaultValues = !!i1099[16]
  var i1101 = i1099[17]
  var i1100 = []
  for(var i = 0; i < i1101.length; i += 2) {
  request.r(i1101[i + 0], i1101[i + 1], 2, i1100, '')
  }
  i1098.behaviours = i1100
  var i1103 = i1099[18]
  var i1102 = []
  for(var i = 0; i < i1103.length; i += 1) {
    i1102.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateTransition', i1103[i + 0]) );
  }
  i1098.transitions = i1102
  return i1098
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateTransition"] = function (request, data, root) {
  var i1108 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateTransition' )
  var i1109 = data
  i1108.fullPath = i1109[0]
  i1108.canTransitionToSelf = !!i1109[1]
  i1108.duration = i1109[2]
  i1108.exitTime = i1109[3]
  i1108.hasExitTime = !!i1109[4]
  i1108.hasFixedDuration = !!i1109[5]
  i1108.interruptionSource = i1109[6]
  i1108.offset = i1109[7]
  i1108.orderedInterruption = !!i1109[8]
  i1108.destinationStateId = i1109[9]
  i1108.isExit = !!i1109[10]
  i1108.mute = !!i1109[11]
  i1108.solo = !!i1109[12]
  var i1111 = i1109[13]
  var i1110 = []
  for(var i = 0; i < i1111.length; i += 1) {
    i1110.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorCondition', i1111[i + 0]) );
  }
  i1108.conditions = i1110
  return i1108
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorTransition"] = function (request, data, root) {
  var i1116 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorTransition' )
  var i1117 = data
  i1116.destinationStateId = i1117[0]
  i1116.isExit = !!i1117[1]
  i1116.mute = !!i1117[2]
  i1116.solo = !!i1117[3]
  var i1119 = i1117[4]
  var i1118 = []
  for(var i = 0; i < i1119.length; i += 1) {
    i1118.push( request.d('Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorCondition', i1119[i + 0]) );
  }
  i1116.conditions = i1118
  return i1116
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorControllerParameter"] = function (request, data, root) {
  var i1122 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorControllerParameter' )
  var i1123 = data
  i1122.defaultBool = !!i1123[0]
  i1122.defaultFloat = i1123[1]
  i1122.defaultInt = i1123[2]
  i1122.name = i1123[3]
  i1122.nameHash = i1123[4]
  i1122.type = i1123[5]
  return i1122
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.TextAsset"] = function (request, data, root) {
  var i1124 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.TextAsset' )
  var i1125 = data
  i1124.name = i1125[0]
  i1124.bytes64 = i1125[1]
  i1124.data = i1125[2]
  return i1124
}

Deserializers["AudioLibrary"] = function (request, data, root) {
  var i1126 = root || request.c( 'AudioLibrary' )
  var i1127 = data
  var i1129 = i1127[0]
  var i1128 = new (System.Collections.Generic.List$1(Bridge.ns('AudioLibrary+ClipEntry')))
  for(var i = 0; i < i1129.length; i += 1) {
    i1128.add(request.d('AudioLibrary+ClipEntry', i1129[i + 0]));
  }
  i1126.clips = i1128
  return i1126
}

Deserializers["AudioLibrary+ClipEntry"] = function (request, data, root) {
  var i1132 = root || request.c( 'AudioLibrary+ClipEntry' )
  var i1133 = data
  i1132.key = i1133[0]
  i1132.channel = i1133[1]
  request.r(i1133[2], i1133[3], 0, i1132, 'clip')
  i1132.volume = i1133[4]
  i1132.loop = !!i1133[5]
  return i1132
}

Deserializers["DG.Tweening.Core.DOTweenSettings"] = function (request, data, root) {
  var i1134 = root || request.c( 'DG.Tweening.Core.DOTweenSettings' )
  var i1135 = data
  i1134.useSafeMode = !!i1135[0]
  i1134.safeModeOptions = request.d('DG.Tweening.Core.DOTweenSettings+SafeModeOptions', i1135[1], i1134.safeModeOptions)
  i1134.timeScale = i1135[2]
  i1134.unscaledTimeScale = i1135[3]
  i1134.useSmoothDeltaTime = !!i1135[4]
  i1134.maxSmoothUnscaledTime = i1135[5]
  i1134.rewindCallbackMode = i1135[6]
  i1134.showUnityEditorReport = !!i1135[7]
  i1134.logBehaviour = i1135[8]
  i1134.drawGizmos = !!i1135[9]
  i1134.defaultRecyclable = !!i1135[10]
  i1134.defaultAutoPlay = i1135[11]
  i1134.defaultUpdateType = i1135[12]
  i1134.defaultTimeScaleIndependent = !!i1135[13]
  i1134.defaultEaseType = i1135[14]
  i1134.defaultEaseOvershootOrAmplitude = i1135[15]
  i1134.defaultEasePeriod = i1135[16]
  i1134.defaultAutoKill = !!i1135[17]
  i1134.defaultLoopType = i1135[18]
  i1134.debugMode = !!i1135[19]
  i1134.debugStoreTargetId = !!i1135[20]
  i1134.showPreviewPanel = !!i1135[21]
  i1134.storeSettingsLocation = i1135[22]
  i1134.modules = request.d('DG.Tweening.Core.DOTweenSettings+ModulesSetup', i1135[23], i1134.modules)
  i1134.createASMDEF = !!i1135[24]
  i1134.showPlayingTweens = !!i1135[25]
  i1134.showPausedTweens = !!i1135[26]
  return i1134
}

Deserializers["DG.Tweening.Core.DOTweenSettings+SafeModeOptions"] = function (request, data, root) {
  var i1136 = root || request.c( 'DG.Tweening.Core.DOTweenSettings+SafeModeOptions' )
  var i1137 = data
  i1136.logBehaviour = i1137[0]
  i1136.nestedTweenFailureBehaviour = i1137[1]
  return i1136
}

Deserializers["DG.Tweening.Core.DOTweenSettings+ModulesSetup"] = function (request, data, root) {
  var i1138 = root || request.c( 'DG.Tweening.Core.DOTweenSettings+ModulesSetup' )
  var i1139 = data
  i1138.showPanel = !!i1139[0]
  i1138.audioEnabled = !!i1139[1]
  i1138.physicsEnabled = !!i1139[2]
  i1138.physics2DEnabled = !!i1139[3]
  i1138.spriteEnabled = !!i1139[4]
  i1138.uiEnabled = !!i1139[5]
  i1138.textMeshProEnabled = !!i1139[6]
  i1138.tk2DEnabled = !!i1139[7]
  i1138.deAudioEnabled = !!i1139[8]
  i1138.deUnityExtendedEnabled = !!i1139[9]
  i1138.epoOutlineEnabled = !!i1139[10]
  return i1138
}

Deserializers["TMPro.TMP_Settings"] = function (request, data, root) {
  var i1140 = root || request.c( 'TMPro.TMP_Settings' )
  var i1141 = data
  i1140.m_enableWordWrapping = !!i1141[0]
  i1140.m_enableKerning = !!i1141[1]
  i1140.m_enableExtraPadding = !!i1141[2]
  i1140.m_enableTintAllSprites = !!i1141[3]
  i1140.m_enableParseEscapeCharacters = !!i1141[4]
  i1140.m_EnableRaycastTarget = !!i1141[5]
  i1140.m_GetFontFeaturesAtRuntime = !!i1141[6]
  i1140.m_missingGlyphCharacter = i1141[7]
  i1140.m_warningsDisabled = !!i1141[8]
  request.r(i1141[9], i1141[10], 0, i1140, 'm_defaultFontAsset')
  i1140.m_defaultFontAssetPath = i1141[11]
  i1140.m_defaultFontSize = i1141[12]
  i1140.m_defaultAutoSizeMinRatio = i1141[13]
  i1140.m_defaultAutoSizeMaxRatio = i1141[14]
  i1140.m_defaultTextMeshProTextContainerSize = new pc.Vec2( i1141[15], i1141[16] )
  i1140.m_defaultTextMeshProUITextContainerSize = new pc.Vec2( i1141[17], i1141[18] )
  i1140.m_autoSizeTextContainer = !!i1141[19]
  i1140.m_IsTextObjectScaleStatic = !!i1141[20]
  var i1143 = i1141[21]
  var i1142 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i1143.length; i += 2) {
  request.r(i1143[i + 0], i1143[i + 1], 1, i1142, '')
  }
  i1140.m_fallbackFontAssets = i1142
  i1140.m_matchMaterialPreset = !!i1141[22]
  request.r(i1141[23], i1141[24], 0, i1140, 'm_defaultSpriteAsset')
  i1140.m_defaultSpriteAssetPath = i1141[25]
  i1140.m_enableEmojiSupport = !!i1141[26]
  i1140.m_MissingCharacterSpriteUnicode = i1141[27]
  i1140.m_defaultColorGradientPresetsPath = i1141[28]
  request.r(i1141[29], i1141[30], 0, i1140, 'm_defaultStyleSheet')
  i1140.m_StyleSheetsResourcePath = i1141[31]
  request.r(i1141[32], i1141[33], 0, i1140, 'm_leadingCharacters')
  request.r(i1141[34], i1141[35], 0, i1140, 'm_followingCharacters')
  i1140.m_UseModernHangulLineBreakingRules = !!i1141[36]
  return i1140
}

Deserializers["TMPro.TMP_FontAsset"] = function (request, data, root) {
  var i1146 = root || request.c( 'TMPro.TMP_FontAsset' )
  var i1147 = data
  request.r(i1147[0], i1147[1], 0, i1146, 'atlas')
  i1146.normalStyle = i1147[2]
  i1146.normalSpacingOffset = i1147[3]
  i1146.boldStyle = i1147[4]
  i1146.boldSpacing = i1147[5]
  i1146.italicStyle = i1147[6]
  i1146.tabSize = i1147[7]
  i1146.hashCode = i1147[8]
  request.r(i1147[9], i1147[10], 0, i1146, 'material')
  i1146.materialHashCode = i1147[11]
  i1146.m_Version = i1147[12]
  i1146.m_SourceFontFileGUID = i1147[13]
  request.r(i1147[14], i1147[15], 0, i1146, 'm_SourceFontFile_EditorRef')
  request.r(i1147[16], i1147[17], 0, i1146, 'm_SourceFontFile')
  i1146.m_AtlasPopulationMode = i1147[18]
  i1146.m_FaceInfo = request.d('UnityEngine.TextCore.FaceInfo', i1147[19], i1146.m_FaceInfo)
  var i1149 = i1147[20]
  var i1148 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.Glyph')))
  for(var i = 0; i < i1149.length; i += 1) {
    i1148.add(request.d('UnityEngine.TextCore.Glyph', i1149[i + 0]));
  }
  i1146.m_GlyphTable = i1148
  var i1151 = i1147[21]
  var i1150 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Character')))
  for(var i = 0; i < i1151.length; i += 1) {
    i1150.add(request.d('TMPro.TMP_Character', i1151[i + 0]));
  }
  i1146.m_CharacterTable = i1150
  var i1153 = i1147[22]
  var i1152 = []
  for(var i = 0; i < i1153.length; i += 2) {
  request.r(i1153[i + 0], i1153[i + 1], 2, i1152, '')
  }
  i1146.m_AtlasTextures = i1152
  i1146.m_AtlasTextureIndex = i1147[23]
  i1146.m_IsMultiAtlasTexturesEnabled = !!i1147[24]
  i1146.m_ClearDynamicDataOnBuild = !!i1147[25]
  var i1155 = i1147[26]
  var i1154 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.GlyphRect')))
  for(var i = 0; i < i1155.length; i += 1) {
    i1154.add(request.d('UnityEngine.TextCore.GlyphRect', i1155[i + 0]));
  }
  i1146.m_UsedGlyphRects = i1154
  var i1157 = i1147[27]
  var i1156 = new (System.Collections.Generic.List$1(Bridge.ns('UnityEngine.TextCore.GlyphRect')))
  for(var i = 0; i < i1157.length; i += 1) {
    i1156.add(request.d('UnityEngine.TextCore.GlyphRect', i1157[i + 0]));
  }
  i1146.m_FreeGlyphRects = i1156
  i1146.m_fontInfo = request.d('TMPro.FaceInfo_Legacy', i1147[28], i1146.m_fontInfo)
  i1146.m_AtlasWidth = i1147[29]
  i1146.m_AtlasHeight = i1147[30]
  i1146.m_AtlasPadding = i1147[31]
  i1146.m_AtlasRenderMode = i1147[32]
  var i1159 = i1147[33]
  var i1158 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Glyph')))
  for(var i = 0; i < i1159.length; i += 1) {
    i1158.add(request.d('TMPro.TMP_Glyph', i1159[i + 0]));
  }
  i1146.m_glyphInfoList = i1158
  i1146.m_KerningTable = request.d('TMPro.KerningTable', i1147[34], i1146.m_KerningTable)
  i1146.m_FontFeatureTable = request.d('TMPro.TMP_FontFeatureTable', i1147[35], i1146.m_FontFeatureTable)
  var i1161 = i1147[36]
  var i1160 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i1161.length; i += 2) {
  request.r(i1161[i + 0], i1161[i + 1], 1, i1160, '')
  }
  i1146.fallbackFontAssets = i1160
  var i1163 = i1147[37]
  var i1162 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_FontAsset')))
  for(var i = 0; i < i1163.length; i += 2) {
  request.r(i1163[i + 0], i1163[i + 1], 1, i1162, '')
  }
  i1146.m_FallbackFontAssetTable = i1162
  i1146.m_CreationSettings = request.d('TMPro.FontAssetCreationSettings', i1147[38], i1146.m_CreationSettings)
  var i1165 = i1147[39]
  var i1164 = []
  for(var i = 0; i < i1165.length; i += 1) {
    i1164.push( request.d('TMPro.TMP_FontWeightPair', i1165[i + 0]) );
  }
  i1146.m_FontWeightTable = i1164
  var i1167 = i1147[40]
  var i1166 = []
  for(var i = 0; i < i1167.length; i += 1) {
    i1166.push( request.d('TMPro.TMP_FontWeightPair', i1167[i + 0]) );
  }
  i1146.fontWeights = i1166
  return i1146
}

Deserializers["UnityEngine.TextCore.FaceInfo"] = function (request, data, root) {
  var i1168 = root || request.c( 'UnityEngine.TextCore.FaceInfo' )
  var i1169 = data
  i1168.m_FaceIndex = i1169[0]
  i1168.m_FamilyName = i1169[1]
  i1168.m_StyleName = i1169[2]
  i1168.m_PointSize = i1169[3]
  i1168.m_Scale = i1169[4]
  i1168.m_UnitsPerEM = i1169[5]
  i1168.m_LineHeight = i1169[6]
  i1168.m_AscentLine = i1169[7]
  i1168.m_CapLine = i1169[8]
  i1168.m_MeanLine = i1169[9]
  i1168.m_Baseline = i1169[10]
  i1168.m_DescentLine = i1169[11]
  i1168.m_SuperscriptOffset = i1169[12]
  i1168.m_SuperscriptSize = i1169[13]
  i1168.m_SubscriptOffset = i1169[14]
  i1168.m_SubscriptSize = i1169[15]
  i1168.m_UnderlineOffset = i1169[16]
  i1168.m_UnderlineThickness = i1169[17]
  i1168.m_StrikethroughOffset = i1169[18]
  i1168.m_StrikethroughThickness = i1169[19]
  i1168.m_TabWidth = i1169[20]
  return i1168
}

Deserializers["UnityEngine.TextCore.Glyph"] = function (request, data, root) {
  var i1172 = root || request.c( 'UnityEngine.TextCore.Glyph' )
  var i1173 = data
  i1172.m_Index = i1173[0]
  i1172.m_Metrics = request.d('UnityEngine.TextCore.GlyphMetrics', i1173[1], i1172.m_Metrics)
  i1172.m_GlyphRect = request.d('UnityEngine.TextCore.GlyphRect', i1173[2], i1172.m_GlyphRect)
  i1172.m_Scale = i1173[3]
  i1172.m_AtlasIndex = i1173[4]
  i1172.m_ClassDefinitionType = i1173[5]
  return i1172
}

Deserializers["UnityEngine.TextCore.GlyphMetrics"] = function (request, data, root) {
  var i1174 = root || request.c( 'UnityEngine.TextCore.GlyphMetrics' )
  var i1175 = data
  i1174.m_Width = i1175[0]
  i1174.m_Height = i1175[1]
  i1174.m_HorizontalBearingX = i1175[2]
  i1174.m_HorizontalBearingY = i1175[3]
  i1174.m_HorizontalAdvance = i1175[4]
  return i1174
}

Deserializers["UnityEngine.TextCore.GlyphRect"] = function (request, data, root) {
  var i1176 = root || request.c( 'UnityEngine.TextCore.GlyphRect' )
  var i1177 = data
  i1176.m_X = i1177[0]
  i1176.m_Y = i1177[1]
  i1176.m_Width = i1177[2]
  i1176.m_Height = i1177[3]
  return i1176
}

Deserializers["TMPro.TMP_Character"] = function (request, data, root) {
  var i1180 = root || request.c( 'TMPro.TMP_Character' )
  var i1181 = data
  i1180.m_ElementType = i1181[0]
  i1180.m_Unicode = i1181[1]
  i1180.m_GlyphIndex = i1181[2]
  i1180.m_Scale = i1181[3]
  return i1180
}

Deserializers["TMPro.FaceInfo_Legacy"] = function (request, data, root) {
  var i1186 = root || request.c( 'TMPro.FaceInfo_Legacy' )
  var i1187 = data
  i1186.Name = i1187[0]
  i1186.PointSize = i1187[1]
  i1186.Scale = i1187[2]
  i1186.CharacterCount = i1187[3]
  i1186.LineHeight = i1187[4]
  i1186.Baseline = i1187[5]
  i1186.Ascender = i1187[6]
  i1186.CapHeight = i1187[7]
  i1186.Descender = i1187[8]
  i1186.CenterLine = i1187[9]
  i1186.SuperscriptOffset = i1187[10]
  i1186.SubscriptOffset = i1187[11]
  i1186.SubSize = i1187[12]
  i1186.Underline = i1187[13]
  i1186.UnderlineThickness = i1187[14]
  i1186.strikethrough = i1187[15]
  i1186.strikethroughThickness = i1187[16]
  i1186.TabWidth = i1187[17]
  i1186.Padding = i1187[18]
  i1186.AtlasWidth = i1187[19]
  i1186.AtlasHeight = i1187[20]
  return i1186
}

Deserializers["TMPro.TMP_Glyph"] = function (request, data, root) {
  var i1190 = root || request.c( 'TMPro.TMP_Glyph' )
  var i1191 = data
  i1190.id = i1191[0]
  i1190.x = i1191[1]
  i1190.y = i1191[2]
  i1190.width = i1191[3]
  i1190.height = i1191[4]
  i1190.xOffset = i1191[5]
  i1190.yOffset = i1191[6]
  i1190.xAdvance = i1191[7]
  i1190.scale = i1191[8]
  return i1190
}

Deserializers["TMPro.KerningTable"] = function (request, data, root) {
  var i1192 = root || request.c( 'TMPro.KerningTable' )
  var i1193 = data
  var i1195 = i1193[0]
  var i1194 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.KerningPair')))
  for(var i = 0; i < i1195.length; i += 1) {
    i1194.add(request.d('TMPro.KerningPair', i1195[i + 0]));
  }
  i1192.kerningPairs = i1194
  return i1192
}

Deserializers["TMPro.KerningPair"] = function (request, data, root) {
  var i1198 = root || request.c( 'TMPro.KerningPair' )
  var i1199 = data
  i1198.xOffset = i1199[0]
  i1198.m_FirstGlyph = i1199[1]
  i1198.m_FirstGlyphAdjustments = request.d('TMPro.GlyphValueRecord_Legacy', i1199[2], i1198.m_FirstGlyphAdjustments)
  i1198.m_SecondGlyph = i1199[3]
  i1198.m_SecondGlyphAdjustments = request.d('TMPro.GlyphValueRecord_Legacy', i1199[4], i1198.m_SecondGlyphAdjustments)
  i1198.m_IgnoreSpacingAdjustments = !!i1199[5]
  return i1198
}

Deserializers["TMPro.TMP_FontFeatureTable"] = function (request, data, root) {
  var i1200 = root || request.c( 'TMPro.TMP_FontFeatureTable' )
  var i1201 = data
  var i1203 = i1201[0]
  var i1202 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_GlyphPairAdjustmentRecord')))
  for(var i = 0; i < i1203.length; i += 1) {
    i1202.add(request.d('TMPro.TMP_GlyphPairAdjustmentRecord', i1203[i + 0]));
  }
  i1200.m_GlyphPairAdjustmentRecords = i1202
  return i1200
}

Deserializers["TMPro.TMP_GlyphPairAdjustmentRecord"] = function (request, data, root) {
  var i1206 = root || request.c( 'TMPro.TMP_GlyphPairAdjustmentRecord' )
  var i1207 = data
  i1206.m_FirstAdjustmentRecord = request.d('TMPro.TMP_GlyphAdjustmentRecord', i1207[0], i1206.m_FirstAdjustmentRecord)
  i1206.m_SecondAdjustmentRecord = request.d('TMPro.TMP_GlyphAdjustmentRecord', i1207[1], i1206.m_SecondAdjustmentRecord)
  i1206.m_FeatureLookupFlags = i1207[2]
  return i1206
}

Deserializers["TMPro.TMP_GlyphAdjustmentRecord"] = function (request, data, root) {
  var i1208 = root || request.c( 'TMPro.TMP_GlyphAdjustmentRecord' )
  var i1209 = data
  i1208.m_GlyphIndex = i1209[0]
  i1208.m_GlyphValueRecord = request.d('TMPro.TMP_GlyphValueRecord', i1209[1], i1208.m_GlyphValueRecord)
  return i1208
}

Deserializers["TMPro.TMP_GlyphValueRecord"] = function (request, data, root) {
  var i1210 = root || request.c( 'TMPro.TMP_GlyphValueRecord' )
  var i1211 = data
  i1210.m_XPlacement = i1211[0]
  i1210.m_YPlacement = i1211[1]
  i1210.m_XAdvance = i1211[2]
  i1210.m_YAdvance = i1211[3]
  return i1210
}

Deserializers["TMPro.FontAssetCreationSettings"] = function (request, data, root) {
  var i1212 = root || request.c( 'TMPro.FontAssetCreationSettings' )
  var i1213 = data
  i1212.sourceFontFileName = i1213[0]
  i1212.sourceFontFileGUID = i1213[1]
  i1212.pointSizeSamplingMode = i1213[2]
  i1212.pointSize = i1213[3]
  i1212.padding = i1213[4]
  i1212.packingMode = i1213[5]
  i1212.atlasWidth = i1213[6]
  i1212.atlasHeight = i1213[7]
  i1212.characterSetSelectionMode = i1213[8]
  i1212.characterSequence = i1213[9]
  i1212.referencedFontAssetGUID = i1213[10]
  i1212.referencedTextAssetGUID = i1213[11]
  i1212.fontStyle = i1213[12]
  i1212.fontStyleModifier = i1213[13]
  i1212.renderMode = i1213[14]
  i1212.includeFontFeatures = !!i1213[15]
  return i1212
}

Deserializers["TMPro.TMP_FontWeightPair"] = function (request, data, root) {
  var i1216 = root || request.c( 'TMPro.TMP_FontWeightPair' )
  var i1217 = data
  request.r(i1217[0], i1217[1], 0, i1216, 'regularTypeface')
  request.r(i1217[2], i1217[3], 0, i1216, 'italicTypeface')
  return i1216
}

Deserializers["TMPro.TMP_SpriteAsset"] = function (request, data, root) {
  var i1218 = root || request.c( 'TMPro.TMP_SpriteAsset' )
  var i1219 = data
  request.r(i1219[0], i1219[1], 0, i1218, 'spriteSheet')
  var i1221 = i1219[2]
  var i1220 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Sprite')))
  for(var i = 0; i < i1221.length; i += 1) {
    i1220.add(request.d('TMPro.TMP_Sprite', i1221[i + 0]));
  }
  i1218.spriteInfoList = i1220
  var i1223 = i1219[3]
  var i1222 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteAsset')))
  for(var i = 0; i < i1223.length; i += 2) {
  request.r(i1223[i + 0], i1223[i + 1], 1, i1222, '')
  }
  i1218.fallbackSpriteAssets = i1222
  i1218.hashCode = i1219[4]
  request.r(i1219[5], i1219[6], 0, i1218, 'material')
  i1218.materialHashCode = i1219[7]
  i1218.m_Version = i1219[8]
  i1218.m_FaceInfo = request.d('UnityEngine.TextCore.FaceInfo', i1219[9], i1218.m_FaceInfo)
  var i1225 = i1219[10]
  var i1224 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteCharacter')))
  for(var i = 0; i < i1225.length; i += 1) {
    i1224.add(request.d('TMPro.TMP_SpriteCharacter', i1225[i + 0]));
  }
  i1218.m_SpriteCharacterTable = i1224
  var i1227 = i1219[11]
  var i1226 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_SpriteGlyph')))
  for(var i = 0; i < i1227.length; i += 1) {
    i1226.add(request.d('TMPro.TMP_SpriteGlyph', i1227[i + 0]));
  }
  i1218.m_SpriteGlyphTable = i1226
  return i1218
}

Deserializers["TMPro.TMP_Sprite"] = function (request, data, root) {
  var i1230 = root || request.c( 'TMPro.TMP_Sprite' )
  var i1231 = data
  i1230.name = i1231[0]
  i1230.hashCode = i1231[1]
  i1230.unicode = i1231[2]
  i1230.pivot = new pc.Vec2( i1231[3], i1231[4] )
  request.r(i1231[5], i1231[6], 0, i1230, 'sprite')
  i1230.id = i1231[7]
  i1230.x = i1231[8]
  i1230.y = i1231[9]
  i1230.width = i1231[10]
  i1230.height = i1231[11]
  i1230.xOffset = i1231[12]
  i1230.yOffset = i1231[13]
  i1230.xAdvance = i1231[14]
  i1230.scale = i1231[15]
  return i1230
}

Deserializers["TMPro.TMP_SpriteCharacter"] = function (request, data, root) {
  var i1236 = root || request.c( 'TMPro.TMP_SpriteCharacter' )
  var i1237 = data
  i1236.m_Name = i1237[0]
  i1236.m_HashCode = i1237[1]
  i1236.m_ElementType = i1237[2]
  i1236.m_Unicode = i1237[3]
  i1236.m_GlyphIndex = i1237[4]
  i1236.m_Scale = i1237[5]
  return i1236
}

Deserializers["TMPro.TMP_SpriteGlyph"] = function (request, data, root) {
  var i1240 = root || request.c( 'TMPro.TMP_SpriteGlyph' )
  var i1241 = data
  request.r(i1241[0], i1241[1], 0, i1240, 'sprite')
  i1240.m_Index = i1241[2]
  i1240.m_Metrics = request.d('UnityEngine.TextCore.GlyphMetrics', i1241[3], i1240.m_Metrics)
  i1240.m_GlyphRect = request.d('UnityEngine.TextCore.GlyphRect', i1241[4], i1240.m_GlyphRect)
  i1240.m_Scale = i1241[5]
  i1240.m_AtlasIndex = i1241[6]
  i1240.m_ClassDefinitionType = i1241[7]
  return i1240
}

Deserializers["TMPro.TMP_StyleSheet"] = function (request, data, root) {
  var i1242 = root || request.c( 'TMPro.TMP_StyleSheet' )
  var i1243 = data
  var i1245 = i1243[0]
  var i1244 = new (System.Collections.Generic.List$1(Bridge.ns('TMPro.TMP_Style')))
  for(var i = 0; i < i1245.length; i += 1) {
    i1244.add(request.d('TMPro.TMP_Style', i1245[i + 0]));
  }
  i1242.m_StyleList = i1244
  return i1242
}

Deserializers["TMPro.TMP_Style"] = function (request, data, root) {
  var i1248 = root || request.c( 'TMPro.TMP_Style' )
  var i1249 = data
  i1248.m_Name = i1249[0]
  i1248.m_HashCode = i1249[1]
  i1248.m_OpeningDefinition = i1249[2]
  i1248.m_ClosingDefinition = i1249[3]
  i1248.m_OpeningTagArray = i1249[4]
  i1248.m_ClosingTagArray = i1249[5]
  i1248.m_OpeningTagUnicodeArray = i1249[6]
  i1248.m_ClosingTagUnicodeArray = i1249[7]
  return i1248
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Resources"] = function (request, data, root) {
  var i1250 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Resources' )
  var i1251 = data
  var i1253 = i1251[0]
  var i1252 = []
  for(var i = 0; i < i1253.length; i += 1) {
    i1252.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.Resources+File', i1253[i + 0]) );
  }
  i1250.files = i1252
  i1250.componentToPrefabIds = i1251[1]
  return i1250
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Resources+File"] = function (request, data, root) {
  var i1256 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Resources+File' )
  var i1257 = data
  i1256.path = i1257[0]
  request.r(i1257[1], i1257[2], 0, i1256, 'unityObject')
  return i1256
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings"] = function (request, data, root) {
  var i1258 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings' )
  var i1259 = data
  var i1261 = i1259[0]
  var i1260 = []
  for(var i = 0; i < i1261.length; i += 1) {
    i1260.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder', i1261[i + 0]) );
  }
  i1258.scriptsExecutionOrder = i1260
  var i1263 = i1259[1]
  var i1262 = []
  for(var i = 0; i < i1263.length; i += 1) {
    i1262.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer', i1263[i + 0]) );
  }
  i1258.sortingLayers = i1262
  var i1265 = i1259[2]
  var i1264 = []
  for(var i = 0; i < i1265.length; i += 1) {
    i1264.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer', i1265[i + 0]) );
  }
  i1258.cullingLayers = i1264
  i1258.timeSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings', i1259[3], i1258.timeSettings)
  i1258.physicsSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings', i1259[4], i1258.physicsSettings)
  i1258.physics2DSettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings', i1259[5], i1258.physics2DSettings)
  i1258.qualitySettings = request.d('Luna.Unity.DTO.UnityEngine.Assets.QualitySettings', i1259[6], i1258.qualitySettings)
  i1258.enableRealtimeShadows = !!i1259[7]
  i1258.enableAutoInstancing = !!i1259[8]
  i1258.enableStaticBatching = !!i1259[9]
  i1258.enableDynamicBatching = !!i1259[10]
  i1258.usePreservativeDynamicBatching = !!i1259[11]
  i1258.lightmapEncodingQuality = i1259[12]
  i1258.desiredColorSpace = i1259[13]
  var i1267 = i1259[14]
  var i1266 = []
  for(var i = 0; i < i1267.length; i += 1) {
    i1266.push( i1267[i + 0] );
  }
  i1258.allTags = i1266
  return i1258
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder"] = function (request, data, root) {
  var i1270 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder' )
  var i1271 = data
  i1270.name = i1271[0]
  i1270.value = i1271[1]
  return i1270
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer"] = function (request, data, root) {
  var i1274 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer' )
  var i1275 = data
  i1274.id = i1275[0]
  i1274.name = i1275[1]
  i1274.value = i1275[2]
  return i1274
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer"] = function (request, data, root) {
  var i1278 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer' )
  var i1279 = data
  i1278.id = i1279[0]
  i1278.name = i1279[1]
  return i1278
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings"] = function (request, data, root) {
  var i1280 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings' )
  var i1281 = data
  i1280.fixedDeltaTime = i1281[0]
  i1280.maximumDeltaTime = i1281[1]
  i1280.timeScale = i1281[2]
  i1280.maximumParticleTimestep = i1281[3]
  return i1280
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings"] = function (request, data, root) {
  var i1282 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings' )
  var i1283 = data
  i1282.gravity = new pc.Vec3( i1283[0], i1283[1], i1283[2] )
  i1282.defaultSolverIterations = i1283[3]
  i1282.bounceThreshold = i1283[4]
  i1282.autoSyncTransforms = !!i1283[5]
  i1282.autoSimulation = !!i1283[6]
  var i1285 = i1283[7]
  var i1284 = []
  for(var i = 0; i < i1285.length; i += 1) {
    i1284.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask', i1285[i + 0]) );
  }
  i1282.collisionMatrix = i1284
  return i1282
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask"] = function (request, data, root) {
  var i1288 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask' )
  var i1289 = data
  i1288.enabled = !!i1289[0]
  i1288.layerId = i1289[1]
  i1288.otherLayerId = i1289[2]
  return i1288
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings"] = function (request, data, root) {
  var i1290 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings' )
  var i1291 = data
  request.r(i1291[0], i1291[1], 0, i1290, 'material')
  i1290.gravity = new pc.Vec2( i1291[2], i1291[3] )
  i1290.positionIterations = i1291[4]
  i1290.velocityIterations = i1291[5]
  i1290.velocityThreshold = i1291[6]
  i1290.maxLinearCorrection = i1291[7]
  i1290.maxAngularCorrection = i1291[8]
  i1290.maxTranslationSpeed = i1291[9]
  i1290.maxRotationSpeed = i1291[10]
  i1290.baumgarteScale = i1291[11]
  i1290.baumgarteTOIScale = i1291[12]
  i1290.timeToSleep = i1291[13]
  i1290.linearSleepTolerance = i1291[14]
  i1290.angularSleepTolerance = i1291[15]
  i1290.defaultContactOffset = i1291[16]
  i1290.autoSimulation = !!i1291[17]
  i1290.queriesHitTriggers = !!i1291[18]
  i1290.queriesStartInColliders = !!i1291[19]
  i1290.callbacksOnDisable = !!i1291[20]
  i1290.reuseCollisionCallbacks = !!i1291[21]
  i1290.autoSyncTransforms = !!i1291[22]
  var i1293 = i1291[23]
  var i1292 = []
  for(var i = 0; i < i1293.length; i += 1) {
    i1292.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask', i1293[i + 0]) );
  }
  i1290.collisionMatrix = i1292
  return i1290
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask"] = function (request, data, root) {
  var i1296 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask' )
  var i1297 = data
  i1296.enabled = !!i1297[0]
  i1296.layerId = i1297[1]
  i1296.otherLayerId = i1297[2]
  return i1296
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.QualitySettings"] = function (request, data, root) {
  var i1298 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.QualitySettings' )
  var i1299 = data
  var i1301 = i1299[0]
  var i1300 = []
  for(var i = 0; i < i1301.length; i += 1) {
    i1300.push( request.d('Luna.Unity.DTO.UnityEngine.Assets.QualitySettings', i1301[i + 0]) );
  }
  i1298.qualityLevels = i1300
  var i1303 = i1299[1]
  var i1302 = []
  for(var i = 0; i < i1303.length; i += 1) {
    i1302.push( i1303[i + 0] );
  }
  i1298.names = i1302
  i1298.shadows = i1299[2]
  i1298.anisotropicFiltering = i1299[3]
  i1298.antiAliasing = i1299[4]
  i1298.lodBias = i1299[5]
  i1298.shadowCascades = i1299[6]
  i1298.shadowDistance = i1299[7]
  i1298.shadowmaskMode = i1299[8]
  i1298.shadowProjection = i1299[9]
  i1298.shadowResolution = i1299[10]
  i1298.softParticles = !!i1299[11]
  i1298.softVegetation = !!i1299[12]
  i1298.activeColorSpace = i1299[13]
  i1298.desiredColorSpace = i1299[14]
  i1298.masterTextureLimit = i1299[15]
  i1298.maxQueuedFrames = i1299[16]
  i1298.particleRaycastBudget = i1299[17]
  i1298.pixelLightCount = i1299[18]
  i1298.realtimeReflectionProbes = !!i1299[19]
  i1298.shadowCascade2Split = i1299[20]
  i1298.shadowCascade4Split = new pc.Vec3( i1299[21], i1299[22], i1299[23] )
  i1298.streamingMipmapsActive = !!i1299[24]
  i1298.vSyncCount = i1299[25]
  i1298.asyncUploadBufferSize = i1299[26]
  i1298.asyncUploadTimeSlice = i1299[27]
  i1298.billboardsFaceCameraPosition = !!i1299[28]
  i1298.shadowNearPlaneOffset = i1299[29]
  i1298.streamingMipmapsMemoryBudget = i1299[30]
  i1298.maximumLODLevel = i1299[31]
  i1298.streamingMipmapsAddAllCameras = !!i1299[32]
  i1298.streamingMipmapsMaxLevelReduction = i1299[33]
  i1298.streamingMipmapsRenderersPerFrame = i1299[34]
  i1298.resolutionScalingFixedDPIFactor = i1299[35]
  i1298.streamingMipmapsMaxFileIORequests = i1299[36]
  i1298.currentQualityLevel = i1299[37]
  return i1298
}

Deserializers["Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame"] = function (request, data, root) {
  var i1308 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame' )
  var i1309 = data
  i1308.weight = i1309[0]
  i1308.vertices = i1309[1]
  i1308.normals = i1309[2]
  i1308.tangents = i1309[3]
  return i1308
}

Deserializers["Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorCondition"] = function (request, data, root) {
  var i1312 = root || request.c( 'Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorCondition' )
  var i1313 = data
  i1312.mode = i1313[0]
  i1312.parameter = i1313[1]
  i1312.threshold = i1313[2]
  return i1312
}

Deserializers["TMPro.GlyphValueRecord_Legacy"] = function (request, data, root) {
  var i1314 = root || request.c( 'TMPro.GlyphValueRecord_Legacy' )
  var i1315 = data
  i1314.xPlacement = i1315[0]
  i1314.yPlacement = i1315[1]
  i1314.xAdvance = i1315[2]
  i1314.yAdvance = i1315[3]
  return i1314
}

Deserializers.fields = {"Luna.Unity.DTO.UnityEngine.Textures.Texture2D":{"name":0,"width":1,"height":2,"mipmapCount":3,"anisoLevel":4,"filterMode":5,"hdr":6,"format":7,"wrapMode":8,"alphaIsTransparency":9,"alphaSource":10,"graphicsFormat":11,"sRGBTexture":12,"desiredColorSpace":13,"wrapU":14,"wrapV":15},"Luna.Unity.DTO.UnityEngine.Assets.Mesh":{"name":0,"halfPrecision":1,"useSimplification":2,"useUInt32IndexFormat":3,"vertexCount":4,"aabb":5,"streams":6,"vertices":7,"subMeshes":8,"bindposes":9,"blendShapes":10},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+SubMesh":{"triangles":0},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShape":{"name":0,"frames":1},"Luna.Unity.DTO.UnityEngine.Assets.Material":{"name":0,"shader":1,"renderQueue":3,"enableInstancing":4,"floatParameters":5,"colorParameters":6,"vectorParameters":7,"textureParameters":8,"materialFlags":9},"Luna.Unity.DTO.UnityEngine.Assets.Material+FloatParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+ColorParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+VectorParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+TextureParameter":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Material+MaterialFlag":{"name":0,"enabled":1},"Luna.Unity.DTO.UnityEngine.Textures.Cubemap":{"name":0,"atlasId":1,"mipmapCount":2,"hdr":3,"size":4,"anisoLevel":5,"filterMode":6,"rects":7,"wrapU":8,"wrapV":9},"Luna.Unity.DTO.UnityEngine.Scene.Scene":{"name":0,"index":1,"startup":2},"Luna.Unity.DTO.UnityEngine.Scene.GameObject":{"name":0,"tagId":1,"enabled":2,"isStatic":3,"layer":4},"Luna.Unity.DTO.UnityEngine.Components.Camera":{"aspect":0,"orthographic":1,"orthographicSize":2,"backgroundColor":3,"nearClipPlane":7,"farClipPlane":8,"fieldOfView":9,"depth":10,"clearFlags":11,"cullingMask":12,"rect":13,"targetTexture":14,"usePhysicalProperties":16,"focalLength":17,"sensorSize":18,"lensShift":20,"gateFit":22,"commandBufferCount":23,"cameraType":24,"enabled":25},"Luna.Unity.DTO.UnityEngine.Components.Light":{"type":0,"color":1,"cullingMask":5,"intensity":6,"range":7,"spotAngle":8,"shadows":9,"shadowNormalBias":10,"shadowBias":11,"shadowStrength":12,"shadowResolution":13,"lightmapBakeType":14,"renderMode":15,"cookie":16,"cookieSize":18,"shadowNearPlane":19,"occlusionMaskChannel":20,"isBaked":21,"mixedLightingMode":22,"enabled":23},"Luna.Unity.DTO.UnityEngine.Components.MeshFilter":{"sharedMesh":0},"Luna.Unity.DTO.UnityEngine.Components.MeshRenderer":{"additionalVertexStreams":0,"enabled":2,"sharedMaterial":3,"sharedMaterials":5,"receiveShadows":6,"shadowCastingMode":7,"sortingLayerID":8,"sortingOrder":9,"lightmapIndex":10,"lightmapSceneIndex":11,"lightmapScaleOffset":12,"lightProbeUsage":16,"reflectionProbeUsage":17},"Luna.Unity.DTO.UnityEngine.Components.RectTransform":{"pivot":0,"anchorMin":2,"anchorMax":4,"sizeDelta":6,"anchoredPosition3D":8,"rotation":11,"scale":15},"Luna.Unity.DTO.UnityEngine.Components.Canvas":{"planeDistance":0,"referencePixelsPerUnit":1,"isFallbackOverlay":2,"renderMode":3,"renderOrder":4,"sortingLayerName":5,"sortingOrder":6,"scaleFactor":7,"worldCamera":8,"overrideSorting":10,"pixelPerfect":11,"targetDisplay":12,"overridePixelPerfect":13,"enabled":14},"Luna.Unity.DTO.UnityEngine.Components.CanvasRenderer":{"cullTransparentMesh":0},"Luna.Unity.DTO.UnityEngine.Components.CanvasGroup":{"m_Alpha":0,"m_Interactable":1,"m_BlocksRaycasts":2,"m_IgnoreParentGroups":3,"enabled":4},"Luna.Unity.DTO.UnityEngine.Components.Animator":{"animatorController":0,"avatar":2,"updateMode":4,"hasTransformHierarchy":5,"applyRootMotion":6,"humanBones":7,"enabled":8},"Luna.Unity.DTO.UnityEngine.Components.ParticleSystem":{"main":0,"colorBySpeed":1,"colorOverLifetime":2,"emission":3,"rotationBySpeed":4,"rotationOverLifetime":5,"shape":6,"sizeBySpeed":7,"sizeOverLifetime":8,"textureSheetAnimation":9,"velocityOverLifetime":10,"noise":11,"inheritVelocity":12,"forceOverLifetime":13,"limitVelocityOverLifetime":14,"useAutoRandomSeed":15,"randomSeed":16},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.MainModule":{"duration":0,"loop":1,"prewarm":2,"startDelay":3,"startLifetime":4,"startSpeed":5,"startSize3D":6,"startSizeX":7,"startSizeY":8,"startSizeZ":9,"startRotation3D":10,"startRotationX":11,"startRotationY":12,"startRotationZ":13,"startColor":14,"gravityModifier":15,"simulationSpace":16,"customSimulationSpace":17,"simulationSpeed":19,"useUnscaledTime":20,"scalingMode":21,"playOnAwake":22,"maxParticles":23,"emitterVelocityMode":24,"stopAction":25},"Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxCurve":{"mode":0,"curveMin":1,"curveMax":2,"curveMultiplier":3,"constantMin":4,"constantMax":5},"Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.MinMaxGradient":{"mode":0,"gradientMin":1,"gradientMax":2,"colorMin":3,"colorMax":7},"Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Gradient":{"mode":0,"colorKeys":1,"alphaKeys":2},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ColorBySpeedModule":{"enabled":0,"color":1,"range":2},"Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Data.GradientColorKey":{"color":0,"time":4},"Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Data.GradientAlphaKey":{"alpha":0,"time":1},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ColorOverLifetimeModule":{"enabled":0,"color":1},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.EmissionModule":{"enabled":0,"rateOverTime":1,"rateOverDistance":2,"bursts":3},"Luna.Unity.DTO.UnityEngine.ParticleSystemTypes.Burst":{"count":0,"cycleCount":1,"minCount":2,"maxCount":3,"repeatInterval":4,"time":5},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.RotationBySpeedModule":{"enabled":0,"x":1,"y":2,"z":3,"separateAxes":4,"range":5},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.RotationOverLifetimeModule":{"enabled":0,"x":1,"y":2,"z":3,"separateAxes":4},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ShapeModule":{"enabled":0,"shapeType":1,"randomDirectionAmount":2,"sphericalDirectionAmount":3,"randomPositionAmount":4,"alignToDirection":5,"radius":6,"radiusMode":7,"radiusSpread":8,"radiusSpeed":9,"radiusThickness":10,"angle":11,"length":12,"boxThickness":13,"meshShapeType":16,"mesh":17,"meshRenderer":19,"skinnedMeshRenderer":21,"useMeshMaterialIndex":23,"meshMaterialIndex":24,"useMeshColors":25,"normalOffset":26,"arc":27,"arcMode":28,"arcSpread":29,"arcSpeed":30,"donutRadius":31,"position":32,"rotation":35,"scale":38},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.SizeBySpeedModule":{"enabled":0,"x":1,"y":2,"z":3,"separateAxes":4,"range":5},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.SizeOverLifetimeModule":{"enabled":0,"x":1,"y":2,"z":3,"separateAxes":4},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.TextureSheetAnimationModule":{"enabled":0,"mode":1,"animation":2,"numTilesX":3,"numTilesY":4,"useRandomRow":5,"frameOverTime":6,"startFrame":7,"cycleCount":8,"rowIndex":9,"flipU":10,"flipV":11,"spriteCount":12,"sprites":13},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.VelocityOverLifetimeModule":{"enabled":0,"x":1,"y":2,"z":3,"radial":4,"speedModifier":5,"space":6,"orbitalX":7,"orbitalY":8,"orbitalZ":9,"orbitalOffsetX":10,"orbitalOffsetY":11,"orbitalOffsetZ":12},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.NoiseModule":{"enabled":0,"separateAxes":1,"strengthX":2,"strengthY":3,"strengthZ":4,"frequency":5,"damping":6,"octaveCount":7,"octaveMultiplier":8,"octaveScale":9,"quality":10,"scrollSpeed":11,"scrollSpeedMultiplier":12,"remapEnabled":13,"remapX":14,"remapY":15,"remapZ":16,"positionAmount":17,"rotationAmount":18,"sizeAmount":19},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.InheritVelocityModule":{"enabled":0,"mode":1,"curve":2},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.ForceOverLifetimeModule":{"enabled":0,"x":1,"y":2,"z":3,"space":4,"randomized":5},"Luna.Unity.DTO.UnityEngine.ParticleSystemModules.LimitVelocityOverLifetimeModule":{"enabled":0,"limit":1,"limitX":2,"limitY":3,"limitZ":4,"dampen":5,"separateAxes":6,"space":7,"drag":8,"multiplyDragByParticleSize":9,"multiplyDragByParticleVelocity":10},"Luna.Unity.DTO.UnityEngine.Components.ParticleSystemRenderer":{"mesh":0,"meshCount":2,"activeVertexStreamsCount":3,"alignment":4,"renderMode":5,"sortMode":6,"lengthScale":7,"velocityScale":8,"cameraVelocityScale":9,"normalDirection":10,"sortingFudge":11,"minParticleSize":12,"maxParticleSize":13,"pivot":14,"trailMaterial":17,"applyActiveColorSpace":19,"enabled":20,"sharedMaterial":21,"sharedMaterials":23,"receiveShadows":24,"shadowCastingMode":25,"sortingLayerID":26,"sortingOrder":27,"lightmapIndex":28,"lightmapSceneIndex":29,"lightmapScaleOffset":30,"lightProbeUsage":34,"reflectionProbeUsage":35},"Luna.Unity.DTO.UnityEngine.Components.BoxCollider":{"center":0,"size":3,"enabled":6,"isTrigger":7,"material":8},"Luna.Unity.DTO.UnityEngine.Components.Rigidbody":{"mass":0,"drag":1,"angularDrag":2,"useGravity":3,"isKinematic":4,"constraints":5,"maxAngularVelocity":6,"collisionDetectionMode":7,"interpolation":8},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings":{"ambientIntensity":0,"reflectionIntensity":1,"ambientMode":2,"ambientLight":3,"ambientSkyColor":7,"ambientGroundColor":11,"ambientEquatorColor":15,"fogColor":19,"fogEndDistance":23,"fogStartDistance":24,"fogDensity":25,"fog":26,"skybox":27,"fogMode":29,"lightmaps":30,"lightProbes":31,"lightmapsMode":32,"mixedBakeMode":33,"environmentLightingMode":34,"ambientProbe":35,"customReflection":36,"defaultReflection":38,"defaultReflectionMode":40,"defaultReflectionResolution":41,"sunLightObjectId":42,"pixelLightCount":43,"defaultReflectionHDR":44,"hasLightDataAsset":45,"hasManualGenerate":46},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+Lightmap":{"lightmapColor":0,"lightmapDirection":2,"shadowMask":4},"Luna.Unity.DTO.UnityEngine.Assets.RenderSettings+LightProbes":{"bakedProbes":0,"positions":1,"hullRays":2,"tetrahedra":3,"neighbours":4,"matrices":5},"Luna.Unity.DTO.UnityEngine.Assets.Shader":{"ShaderCompilationErrors":0,"name":1,"guid":2,"shaderDefinedKeywords":3,"passes":4,"usePasses":5,"defaultParameterValues":6,"unityFallbackShader":7,"readDepth":9,"hasDepthOnlyPass":10,"isCreatedByShaderGraph":11,"disableBatching":12,"compiled":13},"Luna.Unity.DTO.UnityEngine.Assets.Shader+ShaderCompilationError":{"shaderName":0,"errorMessage":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass":{"id":0,"subShaderIndex":1,"name":2,"passType":3,"grabPassTextureName":4,"usePass":5,"zTest":6,"zWrite":7,"culling":8,"blending":9,"alphaBlending":10,"colorWriteMask":11,"offsetUnits":12,"offsetFactor":13,"stencilRef":14,"stencilReadMask":15,"stencilWriteMask":16,"stencilOp":17,"stencilOpFront":18,"stencilOpBack":19,"tags":20,"passDefinedKeywords":21,"passDefinedKeywordGroups":22,"variants":23,"excludedVariants":24,"hasDepthReader":25},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Value":{"val":0,"name":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Blending":{"src":0,"dst":1,"op":2},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+StencilOp":{"pass":0,"fail":1,"zFail":2,"comp":3},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Tag":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+KeywordGroup":{"keywords":0,"hasDiscard":1},"Luna.Unity.DTO.UnityEngine.Assets.Shader+Pass+Variant":{"passId":0,"subShaderIndex":1,"keywords":2,"vertexProgram":3,"fragmentProgram":4,"exportedForWebGl2":5,"readDepth":6},"Luna.Unity.DTO.UnityEngine.Assets.Shader+UsePass":{"shader":0,"pass":2},"Luna.Unity.DTO.UnityEngine.Assets.Shader+DefaultParameterValue":{"name":0,"type":1,"value":2,"textureValue":6,"shaderPropertyFlag":7},"Luna.Unity.DTO.UnityEngine.Textures.Sprite":{"name":0,"texture":1,"aabb":3,"vertices":4,"triangles":5,"textureRect":6,"packedRect":10,"border":14,"transparency":18,"bounds":19,"pixelsPerUnit":20,"textureWidth":21,"textureHeight":22,"nativeSize":23,"pivot":25,"textureRectOffset":27},"Luna.Unity.DTO.UnityEngine.Assets.AudioClip":{"name":0},"Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationClip":{"name":0,"wrapMode":1,"isLooping":2,"length":3,"curves":4,"events":5,"halfPrecision":6,"_frameRate":7,"localBounds":8,"hasMuscleCurves":9,"clipMuscleConstant":10,"clipBindingConstant":11},"Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationCurve":{"path":0,"hash":1,"componentType":2,"property":3,"keys":4,"objectReferenceKeys":5},"Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationCurve+ObjectReferenceKey":{"time":0,"value":1},"Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationEvent":{"functionName":0,"floatParameter":1,"intParameter":2,"stringParameter":3,"objectReferenceParameter":4,"time":6},"Luna.Unity.DTO.UnityEngine.Animation.Data.Bounds":{"center":0,"extends":3},"Luna.Unity.DTO.UnityEngine.Animation.Data.AnimationClip+AnimationClipBindingConstant":{"genericBindings":0,"pptrCurveMapping":1},"Luna.Unity.DTO.UnityEngine.Assets.Font":{"name":0,"ascent":1,"originalLineHeight":2,"fontSize":3,"characterInfo":4,"texture":5,"originalFontSize":7},"Luna.Unity.DTO.UnityEngine.Assets.Font+CharacterInfo":{"index":0,"advance":1,"bearing":2,"glyphWidth":3,"glyphHeight":4,"minX":5,"maxX":6,"minY":7,"maxY":8,"uvBottomLeftX":9,"uvBottomLeftY":10,"uvBottomRightX":11,"uvBottomRightY":12,"uvTopLeftX":13,"uvTopLeftY":14,"uvTopRightX":15,"uvTopRightY":16},"Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorController":{"name":0,"layers":1,"parameters":2,"animationClips":3,"avatarUnsupported":4},"Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorControllerLayer":{"name":0,"defaultWeight":1,"blendingMode":2,"avatarMask":3,"syncedLayerIndex":4,"syncedLayerAffectsTiming":5,"syncedLayers":6,"stateMachine":7},"Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateMachine":{"id":0,"name":1,"path":2,"states":3,"machines":4,"entryStateTransitions":5,"exitStateTransitions":6,"anyStateTransitions":7,"defaultStateId":8},"Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorState":{"id":0,"name":1,"cycleOffset":2,"cycleOffsetParameter":3,"cycleOffsetParameterActive":4,"mirror":5,"mirrorParameter":6,"mirrorParameterActive":7,"motionId":8,"nameHash":9,"fullPathHash":10,"speed":11,"speedParameter":12,"speedParameterActive":13,"tag":14,"tagHash":15,"writeDefaultValues":16,"behaviours":17,"transitions":18},"Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorStateTransition":{"fullPath":0,"canTransitionToSelf":1,"duration":2,"exitTime":3,"hasExitTime":4,"hasFixedDuration":5,"interruptionSource":6,"offset":7,"orderedInterruption":8,"destinationStateId":9,"isExit":10,"mute":11,"solo":12,"conditions":13},"Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorTransition":{"destinationStateId":0,"isExit":1,"mute":2,"solo":3,"conditions":4},"Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorControllerParameter":{"defaultBool":0,"defaultFloat":1,"defaultInt":2,"name":3,"nameHash":4,"type":5},"Luna.Unity.DTO.UnityEngine.Assets.TextAsset":{"name":0,"bytes64":1,"data":2},"Luna.Unity.DTO.UnityEngine.Assets.Resources":{"files":0,"componentToPrefabIds":1},"Luna.Unity.DTO.UnityEngine.Assets.Resources+File":{"path":0,"unityObject":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings":{"scriptsExecutionOrder":0,"sortingLayers":1,"cullingLayers":2,"timeSettings":3,"physicsSettings":4,"physics2DSettings":5,"qualitySettings":6,"enableRealtimeShadows":7,"enableAutoInstancing":8,"enableStaticBatching":9,"enableDynamicBatching":10,"usePreservativeDynamicBatching":11,"lightmapEncodingQuality":12,"desiredColorSpace":13,"allTags":14},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+ScriptsExecutionOrder":{"name":0,"value":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+SortingLayer":{"id":0,"name":1,"value":2},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+CullingLayer":{"id":0,"name":1},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+TimeSettings":{"fixedDeltaTime":0,"maximumDeltaTime":1,"timeScale":2,"maximumParticleTimestep":3},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings":{"gravity":0,"defaultSolverIterations":3,"bounceThreshold":4,"autoSyncTransforms":5,"autoSimulation":6,"collisionMatrix":7},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+PhysicsSettings+CollisionMask":{"enabled":0,"layerId":1,"otherLayerId":2},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings":{"material":0,"gravity":2,"positionIterations":4,"velocityIterations":5,"velocityThreshold":6,"maxLinearCorrection":7,"maxAngularCorrection":8,"maxTranslationSpeed":9,"maxRotationSpeed":10,"baumgarteScale":11,"baumgarteTOIScale":12,"timeToSleep":13,"linearSleepTolerance":14,"angularSleepTolerance":15,"defaultContactOffset":16,"autoSimulation":17,"queriesHitTriggers":18,"queriesStartInColliders":19,"callbacksOnDisable":20,"reuseCollisionCallbacks":21,"autoSyncTransforms":22,"collisionMatrix":23},"Luna.Unity.DTO.UnityEngine.Assets.ProjectSettings+Physics2DSettings+CollisionMask":{"enabled":0,"layerId":1,"otherLayerId":2},"Luna.Unity.DTO.UnityEngine.Assets.QualitySettings":{"qualityLevels":0,"names":1,"shadows":2,"anisotropicFiltering":3,"antiAliasing":4,"lodBias":5,"shadowCascades":6,"shadowDistance":7,"shadowmaskMode":8,"shadowProjection":9,"shadowResolution":10,"softParticles":11,"softVegetation":12,"activeColorSpace":13,"desiredColorSpace":14,"masterTextureLimit":15,"maxQueuedFrames":16,"particleRaycastBudget":17,"pixelLightCount":18,"realtimeReflectionProbes":19,"shadowCascade2Split":20,"shadowCascade4Split":21,"streamingMipmapsActive":24,"vSyncCount":25,"asyncUploadBufferSize":26,"asyncUploadTimeSlice":27,"billboardsFaceCameraPosition":28,"shadowNearPlaneOffset":29,"streamingMipmapsMemoryBudget":30,"maximumLODLevel":31,"streamingMipmapsAddAllCameras":32,"streamingMipmapsMaxLevelReduction":33,"streamingMipmapsRenderersPerFrame":34,"resolutionScalingFixedDPIFactor":35,"streamingMipmapsMaxFileIORequests":36,"currentQualityLevel":37},"Luna.Unity.DTO.UnityEngine.Assets.Mesh+BlendShapeFrame":{"weight":0,"vertices":1,"normals":2,"tangents":3},"Luna.Unity.DTO.UnityEngine.Animation.Mecanim.AnimatorCondition":{"mode":0,"parameter":1,"threshold":2}}

Deserializers.requiredComponents = {"53":[54],"55":[54],"56":[54],"57":[54],"58":[54],"59":[54],"60":[61],"62":[13],"63":[42],"64":[42],"65":[42],"66":[42],"67":[42],"68":[42],"69":[42],"70":[71],"72":[71],"73":[71],"74":[71],"75":[71],"76":[71],"77":[71],"78":[71],"79":[71],"80":[71],"81":[71],"82":[71],"83":[71],"84":[13],"85":[23],"86":[87],"88":[87],"29":[12],"24":[42],"43":[89],"11":[13],"4":[3],"3":[4,5,8],"5":[3],"90":[26,23],"8":[3],"91":[12],"92":[23,12],"93":[12,32],"94":[12],"95":[32,12],"96":[23],"97":[32,12],"98":[12],"99":[100],"101":[100],"102":[12],"103":[12],"31":[29],"9":[32,12],"104":[12],"30":[29],"105":[12],"106":[12],"107":[12],"108":[12],"109":[12],"110":[12],"111":[12],"112":[12],"113":[12],"114":[32,12],"115":[12],"116":[12],"117":[12],"118":[12],"119":[32,12],"120":[12],"121":[15],"122":[15],"16":[15],"123":[15],"124":[13],"125":[13],"126":[100]}

Deserializers.types = ["UnityEngine.Shader","UnityEngine.Texture2D","UnityEngine.MonoBehaviour","CTAManager","ControlManager","IterationVariantManagers","UnityEngine.GameObject","UnityEngine.CanvasGroup","ScoreManager","UnityEngine.UI.Image","CameraManager","CameraFitter","UnityEngine.RectTransform","UnityEngine.Camera","UnityEngine.EventSystems.UIBehaviour","UnityEngine.EventSystems.EventSystem","UnityEngine.EventSystems.StandaloneInputModule","UnityEngine.AudioListener","UnityEngine.Light","AudioManager","AudioLibrary","GameManager","UnityEngine.Transform","UnityEngine.MeshRenderer","Brick","BoardManager","UnityEngine.MeshFilter","UnityEngine.Mesh","UnityEngine.Material","UnityEngine.Canvas","UnityEngine.UI.CanvasScaler","UnityEngine.UI.GraphicRaycaster","UnityEngine.CanvasRenderer","UnityEngine.Sprite","UnityEngine.UI.Button","UnityEngine.Animator","UnityEditor.Animations.AnimatorController","UnityEngine.ParticleSystem","UnityEngine.ParticleSystemRenderer","UnityEngine.BoxCollider","GridSlot","Gate","UnityEngine.Rigidbody","BrickCell","UnityEngine.Cubemap","UnityEngine.AudioClip","DG.Tweening.Core.DOTweenSettings","TMPro.TMP_Settings","TMPro.TMP_FontAsset","TMPro.TMP_SpriteAsset","TMPro.TMP_StyleSheet","UnityEngine.TextAsset","UnityEngine.Font","UnityEngine.AudioLowPassFilter","UnityEngine.AudioBehaviour","UnityEngine.AudioHighPassFilter","UnityEngine.AudioReverbFilter","UnityEngine.AudioDistortionFilter","UnityEngine.AudioEchoFilter","UnityEngine.AudioChorusFilter","UnityEngine.Cloth","UnityEngine.SkinnedMeshRenderer","UnityEngine.FlareLayer","UnityEngine.ConstantForce","UnityEngine.Joint","UnityEngine.HingeJoint","UnityEngine.SpringJoint","UnityEngine.FixedJoint","UnityEngine.CharacterJoint","UnityEngine.ConfigurableJoint","UnityEngine.CompositeCollider2D","UnityEngine.Rigidbody2D","UnityEngine.Joint2D","UnityEngine.AnchoredJoint2D","UnityEngine.SpringJoint2D","UnityEngine.DistanceJoint2D","UnityEngine.FrictionJoint2D","UnityEngine.HingeJoint2D","UnityEngine.RelativeJoint2D","UnityEngine.SliderJoint2D","UnityEngine.TargetJoint2D","UnityEngine.FixedJoint2D","UnityEngine.WheelJoint2D","UnityEngine.ConstantForce2D","UnityEngine.StreamingController","UnityEngine.TextMesh","UnityEngine.Tilemaps.TilemapRenderer","UnityEngine.Tilemaps.Tilemap","UnityEngine.Tilemaps.TilemapCollider2D","UnityEngine.Collider","MeshCombiner","TMPro.TextContainer","TMPro.TextMeshPro","TMPro.TextMeshProUGUI","TMPro.TMP_Dropdown","TMPro.TMP_SelectionCaret","TMPro.TMP_SubMesh","TMPro.TMP_SubMeshUI","TMPro.TMP_Text","Unity.VisualScripting.SceneVariables","Unity.VisualScripting.Variables","Unity.VisualScripting.StateMachine","UnityEngine.UI.Dropdown","UnityEngine.UI.Graphic","UnityEngine.UI.AspectRatioFitter","UnityEngine.UI.ContentSizeFitter","UnityEngine.UI.GridLayoutGroup","UnityEngine.UI.HorizontalLayoutGroup","UnityEngine.UI.HorizontalOrVerticalLayoutGroup","UnityEngine.UI.LayoutElement","UnityEngine.UI.LayoutGroup","UnityEngine.UI.VerticalLayoutGroup","UnityEngine.UI.Mask","UnityEngine.UI.MaskableGraphic","UnityEngine.UI.RawImage","UnityEngine.UI.RectMask2D","UnityEngine.UI.Scrollbar","UnityEngine.UI.ScrollRect","UnityEngine.UI.Slider","UnityEngine.UI.Text","UnityEngine.UI.Toggle","UnityEngine.EventSystems.BaseInputModule","UnityEngine.EventSystems.PointerInputModule","UnityEngine.EventSystems.TouchInputModule","UnityEngine.EventSystems.Physics2DRaycaster","UnityEngine.EventSystems.PhysicsRaycaster","Unity.VisualScripting.ScriptMachine"]

Deserializers.unityVersion = "2022.3.3f1";

Deserializers.productName = "Playable Ad";

Deserializers.lunaInitializationTime = "06/02/2026 02:50:54";

Deserializers.lunaDaysRunning = "0.0";

Deserializers.lunaVersion = "7.2.0";

Deserializers.lunaSHA = "ea08d29afe2968efcb8d91d5624f033c6485cc68";

Deserializers.creativeName = "BBS-Corners-ver";

Deserializers.lunaAppID = "37223";

Deserializers.projectId = "e998811c4a312044fbb6d2ce9d30830f";

Deserializers.packagesInfo = "com.unity.textmeshpro: 3.0.6\ncom.unity.timeline: 1.7.4\ncom.unity.ugui: 1.0.0";

Deserializers.externalJsLibraries = "";

Deserializers.androidLink = ( typeof window !== "undefined")&&window.$environment.packageConfig.androidLink?window.$environment.packageConfig.androidLink:'Empty';

Deserializers.iosLink = ( typeof window !== "undefined")&&window.$environment.packageConfig.iosLink?window.$environment.packageConfig.iosLink:'Empty';

Deserializers.base64Enabled = "False";

Deserializers.minifyEnabled = "True";

Deserializers.isForceUncompressed = "False";

Deserializers.isAntiAliasingEnabled = "True";

Deserializers.isRuntimeAnalysisEnabledForCode = "False";

Deserializers.runtimeAnalysisExcludedClassesCount = "1701";

Deserializers.runtimeAnalysisExcludedMethodsCount = "4644";

Deserializers.runtimeAnalysisExcludedModules = "physics2d";

Deserializers.isRuntimeAnalysisEnabledForShaders = "True";

Deserializers.isRealtimeShadowsEnabled = "False";

Deserializers.isLunaCompilerV2Used = "False";

Deserializers.companyName = "HPL Game Design";

Deserializers.buildPlatform = "StandaloneWindows64";

Deserializers.applicationIdentifier = "com.Unity-Technologies.com.unity.template.urp-blank";

Deserializers.disableAntiAliasing = false;

Deserializers.graphicsConstraint = 28;

Deserializers.linearColorSpace = true;

Deserializers.buildID = "f0599cdd-c90d-451f-bb6b-ae69f70595f4";

Deserializers.runtimeInitializeOnLoadInfos = [[["UnityEngine","Experimental","Rendering","ScriptableRuntimeReflectionSystemSettings","ScriptingDirtyReflectionSystemInstance"]],[["Unity","VisualScripting","RuntimeVSUsageUtility","RuntimeInitializeOnLoadBeforeSceneLoad"]],[],[],[]];

Deserializers.typeNameToIdMap = function(){ var i = 0; return Deserializers.types.reduce( function( res, item ) { res[ item ] = i++; return res; }, {} ) }()

