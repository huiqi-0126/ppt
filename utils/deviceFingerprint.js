// 生成设备指纹
export const generateDeviceFingerprint = async () => {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    navigator.deviceMemory,
    screen.width + 'x' + screen.height,
    navigator.platform
  ];
  
  // 使用 SHA-256 生成唯一标识
  const text = components.join('|||');
  const msgBuffer = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 获取或创建用户ID
export const getUserId = async () => {
  try {
    let userId = '';
    
    // 尝试从localStorage获取
    try {
      userId = localStorage.getItem('userId') || '';
    } catch (error) {
      console.warn('访问localStorage失败，使用回退方案:', error);
    }
    
    // 如果获取失败或为空，生成新的userId
    if (!userId) {
      try {
        userId = await generateDeviceFingerprint();
        // 尝试保存到localStorage
        try {
          localStorage.setItem('userId', userId);
        } catch (error) {
          console.warn('保存userId到localStorage失败:', error);
        }
      } catch (error) {
        console.error('生成设备指纹失败，使用随机ID:', error);
        // 回退方案：使用时间戳+随机数
        userId = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      }
    }
    
    console.log('Current userId:', userId);
    return userId;
  } catch (error) {
    console.error('获取用户ID失败，使用随机ID:', error);
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }
}
