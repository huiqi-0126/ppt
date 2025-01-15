import { useEffect, useState } from 'react';
import { getUserId } from '../utils/deviceFingerprint';

function Header() {
  const [userId, setUserId] = useState('');
  
  useEffect(() => {
    const initUserId = async () => {
      const id = await getUserId();
      setUserId(id.slice(-6)); // 只显示后6位
    };
    
    initUserId();
  }, []);

  return (
    <header>
      <div className="header-content">
        {/* ... 其他header内容 ... */}
        <div className="user-info">
          <span className="user-icon">👤</span>
          <span className="user-id">{userId}</span>
        </div>
      </div>
    </header>
  );
}

export default Header; 