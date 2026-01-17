import { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: string;
  email?: string;
  username: string;
  role: string;
  status?: string;
}

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [groupCode, setGroupCode] = useState<string>('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // 페이지 로드 시 로그인 상태 복원 (sessionStorage 사용)
  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');
    const savedGroupCode = sessionStorage.getItem('groupCode');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setGroupCode(savedGroupCode || '');
      setIsLoggedIn(true);

      // 데이터 로드
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role === 'ADMIN') {
        loadPendingRoots(parsedUser.id, savedToken);
      } else if (parsedUser.role === 'ROOT' && parsedUser.status === 'APPROVED') {
        loadUsers(parsedUser.id, savedToken);
      }
    }
  }, []);

  // 회원가입 상태 (Root)
  const [signupData, setSignupData] = useState({
    email: '',
    username: '',
    password: '',
  });

  // 로그인 상태
  const [loginData, setLoginData] = useState({
    email: '',
    username: '',
    groupCode: '',
    password: '',
  });
  const [loginMode, setLoginMode] = useState<'root' | 'user'>('root'); // ROOT/ADMIN vs USER 로그인 모드

  // ADMIN 대시보드 상태
  const [pendingRoots, setPendingRoots] = useState<User[]>([]);

  // Root 대시보드 상태
  const [users, setUsers] = useState<User[]>([]);
  const [newUserData, setNewUserData] = useState({
    username: '',
    password: '',
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserData, setEditUserData] = useState({
    username: '',
    password: '',
  });

  const showMessage = (msg: string, error = false) => {
    setMessage(msg);
    setIsError(error);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || '회원가입 실패');
      
      showMessage('회원가입 성공! 관리자 승인을 기다려주세요.');
      setSignupData({ email: '', username: '', password: '' });
      setAuthMode('login');
    } catch (err: any) {
      showMessage(err.message, true);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 로그인 모드에 따라 필요한 필드만 전송
      const requestBody = loginMode === 'root'
        ? { email: loginData.email, password: loginData.password }  // ROOT/ADMIN
        : { username: loginData.username, groupCode: loginData.groupCode, password: loginData.password };  // USER
      
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || '로그인 실패');
      
      // sessionStorage에 저장 (탭마다 독립적)
      sessionStorage.setItem('token', data.accessToken);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      if (data.groupCode) {
        sessionStorage.setItem('groupCode', data.groupCode);
      }
      
      setToken(data.accessToken);
      setUser(data.user);
      setGroupCode(data.groupCode || '');
      setIsLoggedIn(true);
      
      // 상태별 메시지
      if (data.user.status === 'PENDING') {
        showMessage('승인 대기 중입니다. 관리자 승인 후 기능을 사용하실 수 있습니다.');
      } else if (data.user.status === 'REJECTED') {
        showMessage('죄송합니다. 승인이 거절되었습니다.', true);
      } else {
        showMessage(`환영합니다, ${data.user.username}님!`);
      }
      
      // 역할별 데이터 로드 (승인된 경우만)
      if (data.user.role === 'ADMIN') {
        loadPendingRoots(data.user.id, data.accessToken);
      } else if (data.user.role === 'ROOT' && data.user.status === 'APPROVED') {
        loadUsers(data.user.id, data.accessToken);
      }
    } catch (err: any) {
      showMessage(err.message, true);
    }
  };

  const loadPendingRoots = async (adminUserId: string, accessToken: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/auth/pending-roots/${adminUserId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setPendingRoots(data);
    } catch (err) {
      console.error('Failed to load pending roots:', err);
    }
  };

  const approveRoot = async (rootUserId: string, approved: boolean) => {
    try {
      const res = await fetch(`http://localhost:3000/api/auth/approve-root/${rootUserId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          approved,
          adminUserId: user!.id,
        }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error('승인 처리 실패');
      
      if (approved) {
        showMessage(`승인 완료! 그룹 코드: ${data.groupCode}`);
      } else {
        showMessage('거절 완료');
      }
      loadPendingRoots(user!.id, token!);
    } catch (err: any) {
      showMessage(err.message, true);
    }
  };

  const loadUsers = async (rootUserId: string, accessToken: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/auth/users/${rootUserId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newUserData,
          rootUserId: user!.id,
        }),
      });
      
      if (!res.ok) throw new Error('사용자 생성 실패');
      
      showMessage('사용자가 생성되었습니다.');
      setNewUserData({ username: '', password: '' });
      loadUsers(user!.id, token!);
    } catch (err: any) {
      showMessage(err.message, true);
    }
  };

  const startEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setEditUserData({
      username: userToEdit.username,
      password: '',
    });
  };

  const cancelEditUser = () => {
    setEditingUser(null);
    setEditUserData({ username: '', password: '' });
  };

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const updateData: any = { rootUserId: user!.id };
      if (editUserData.username !== editingUser.username) {
        updateData.username = editUserData.username;
      }
      if (editUserData.password) {
        updateData.password = editUserData.password;
      }

      const res = await fetch(`http://localhost:3000/api/auth/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      
      if (!res.ok) throw new Error('사용자 수정 실패');
      
      showMessage('사용자가 수정되었습니다.');
      cancelEditUser();
      loadUsers(user!.id, token!);
    } catch (err: any) {
      showMessage(err.message, true);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rootUserId: user!.id }),
      });
      
      if (!res.ok) throw new Error('사용자 삭제 실패');
      
      showMessage('사용자가 삭제되었습니다.');
      loadUsers(user!.id, token!);
    } catch (err: any) {
      showMessage(err.message, true);
    }
  };

  const logout = () => {
    // sessionStorage 클리어
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('groupCode');
    
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    setGroupCode('');
    setUsers([]);
    setPendingRoots([]);
    setLoginData({ email: '', username: '', groupCode: '', password: '' });
    showMessage('로그아웃되었습니다.');
  };

  if (isLoggedIn && user) {
    // PENDING 상태 화면
    if (user.status === 'PENDING') {
      return (
        <div className="container">
          <header className="header">
            <h1>WorkWork</h1>
            <div className="user-info">
              <span className="username">{user.username}</span>
              <span className="badge badge-pending">승인 대기</span>
              <button onClick={logout} className="btn btn-secondary">로그아웃</button>
            </div>
          </header>

          <div className="dashboard">
            <section className="card card-pending">
              <h2>⏳ 승인 대기 중</h2>
              <p className="pending-message">
                회원가입이 완료되었습니다.<br/>
                관리자의 승인을 기다리고 있습니다.
              </p>
              <p className="info-text">
                승인이 완료되면 이메일로 알림을 드립니다.<br/>
                잠시만 기다려주세요.
              </p>
            </section>
          </div>
        </div>
      );
    }

    // REJECTED 상태 화면
    if (user.status === 'REJECTED') {
      return (
        <div className="container">
          <header className="header">
            <h1>WorkWork</h1>
            <div className="user-info">
              <span className="username">{user.username}</span>
              <span className="badge badge-rejected">승인 거절</span>
              <button onClick={logout} className="btn btn-secondary">로그아웃</button>
            </div>
          </header>

          <div className="dashboard">
            <section className="card card-rejected">
              <h2>❌ 승인 거절</h2>
              <p className="rejected-message">
                죄송합니다. 회원가입이 거절되었습니다.
              </p>
              <p className="info-text">
                자세한 사항은 관리자에게 문의해주세요.
              </p>
            </section>
          </div>
        </div>
      );
    }

    // APPROVED 또는 ADMIN 화면
    return (
      <div className="container">
        <header className="header">
          <h1>WorkWork</h1>
          <div className="user-info">
            <span className="username">{user.username}</span>
            <span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : user.role === 'ROOT' ? 'badge-root' : 'badge-user'}`}>
              {user.role}
            </span>
            <button onClick={logout} className="btn btn-secondary">로그아웃</button>
          </div>
        </header>

        {message && (
          <div className={`message ${isError ? 'message-error' : 'message-success'}`}>
            {message}
          </div>
        )}

        <div className="dashboard">
          {user.role === 'ADMIN' && (
            <>
              <section className="card">
                <h2>시스템 관리</h2>
                <div className="group-info">
                  <div className="info-row">
                    <span className="label">역할:</span>
                    <span className="value">서비스 관리자</span>
                  </div>
                  <p className="info-text">
                    Root 회원가입을 승인하고 그룹을 생성할 수 있습니다.
                  </p>
                </div>
              </section>

              <section className="card">
                <h2>승인 대기 중인 Root 사용자</h2>
                {pendingRoots.length === 0 ? (
                  <p className="empty">승인 대기 중인 사용자가 없습니다.</p>
                ) : (
                  <div className="user-list">
                    {pendingRoots.map((root) => (
                      <div key={root.id} className="user-item">
                        <div className="user-details">
                          <span className="user-name">{root.username}</span>
                          <span className="user-email">{root.email}</span>
                          <span className="badge badge-pending">PENDING</span>
                        </div>
                        <div className="user-actions">
                          <button
                            onClick={() => approveRoot(root.id, true)}
                            className="btn btn-small btn-success"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => approveRoot(root.id, false)}
                            className="btn btn-small btn-danger"
                          >
                            거절
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {user.role === 'ROOT' && (
            <>
              <section className="card">
                <h2>그룹 정보</h2>
                <div className="group-info">
                  <div className="info-row">
                    <span className="label">그룹 코드:</span>
                    <span className="value code">{groupCode}</span>
                  </div>
                  <p className="info-text">
                    이 그룹 코드를 사용자에게 공유하세요.
                  </p>
                </div>
              </section>

              <section className="card">
                <h2>사용자 생성</h2>
                <form onSubmit={createUser} className="form-inline">
                  <input
                    type="text"
                    placeholder="사용자 아이디"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                    required
                    className="input"
                  />
                  <input
                    type="password"
                    placeholder="비밀번호"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    required
                    className="input"
                  />
                  <button type="submit" className="btn btn-primary">생성</button>
                </form>
              </section>

              <section className="card">
                <h2>그룹 사용자 목록</h2>
                {users.length === 0 ? (
                  <p className="empty">사용자가 없습니다.</p>
                ) : (
                  <div className="user-list">
                    {users.map((u) => (
                      <div key={u.id} className="user-item">
                        {editingUser?.id === u.id ? (
                          // 수정 모드
                          <form onSubmit={updateUser} className="user-edit-form">
                            <div className="user-edit-inputs">
                              <input
                                type="text"
                                placeholder="사용자 아이디"
                                value={editUserData.username}
                                onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                                required
                                className="input input-small"
                              />
                              <input
                                type="password"
                                placeholder="새 비밀번호 (선택)"
                                value={editUserData.password}
                                onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                                className="input input-small"
                              />
                            </div>
                            <div className="user-actions">
                              <button type="submit" className="btn btn-small btn-success">
                                저장
                              </button>
                              <button
                                type="button"
                                onClick={cancelEditUser}
                                className="btn btn-small btn-secondary"
                              >
                                취소
                              </button>
                            </div>
                          </form>
                        ) : (
                          // 일반 모드
                          <>
                            <div className="user-details">
                              <span className="user-name">{u.username}</span>
                              {u.email && <span className="user-email">{u.email}</span>}
                              <span className={`badge ${u.role === 'ROOT' ? 'badge-root' : 'badge-user'}`}>
                                {u.role}
                              </span>
                            </div>
                            {u.role === 'USER' && (
                              <div className="user-actions">
                                <button
                                  onClick={() => startEditUser(u)}
                                  className="btn btn-small btn-primary"
                                >
                                  수정
                                </button>
                                <button
                                  onClick={() => deleteUser(u.id)}
                                  className="btn btn-small btn-danger"
                                >
                                  삭제
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}

          {user.role === 'USER' && (
            <section className="card">
              <h2>내 정보</h2>
              <div className="group-info">
                <div className="info-row">
                  <span className="label">사용자명:</span>
                  <span className="value">{user.username}</span>
                </div>
                <div className="info-row">
                  <span className="label">역할:</span>
                  <span className="value">{user.role}</span>
                </div>
                <div className="info-row">
                  <span className="label">그룹 코드:</span>
                  <span className="value code">{groupCode}</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">WorkWork</h1>
        <p className="auth-subtitle">1시간 공유 Todo 리스트</p>

        {message && (
          <div className={`message ${isError ? 'message-error' : 'message-success'}`}>
            {message}
          </div>
        )}

        <div className="auth-tabs">
          <button
            className={`tab ${authMode === 'login' ? 'tab-active' : ''}`}
            onClick={() => setAuthMode('login')}
          >
            로그인
          </button>
          <button
            className={`tab ${authMode === 'signup' ? 'tab-active' : ''}`}
            onClick={() => setAuthMode('signup')}
          >
            회원가입
          </button>
        </div>

        {authMode === 'signup' ? (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label>이메일</label>
              <input
                type="email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
                className="input"
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label>사용자명</label>
              <input
                type="text"
                value={signupData.username}
                onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                required
                className="input"
                placeholder="username"
              />
            </div>
            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full">회원가입</button>
            <p className="info-text">
              ※ Root 회원가입 후 관리자 승인이 필요합니다.
            </p>
          </form>
        ) : (
          <>
            <div className="login-mode-tabs">
              <button
                type="button"
                className={`login-mode-tab ${loginMode === 'root' ? 'active' : ''}`}
                onClick={() => {
                  setLoginMode('root');
                  setLoginData({ email: '', username: '', groupCode: '', password: '' });
                }}
              >
                ROOT / ADMIN
              </button>
              <button
                type="button"
                className={`login-mode-tab ${loginMode === 'user' ? 'active' : ''}`}
                onClick={() => {
                  setLoginMode('user');
                  setLoginData({ email: '', username: '', groupCode: '', password: '' });
                }}
              >
                그룹 사용자
              </button>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              {loginMode === 'root' ? (
                // ROOT/ADMIN 로그인: email + password
                <>
                  <div className="form-group">
                    <label>이메일</label>
                    <input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="input"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>비밀번호</label>
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              ) : (
                // USER 로그인: username + groupCode + password
                <>
                  <div className="form-group">
                    <label>그룹 코드</label>
                    <input
                      type="text"
                      value={loginData.groupCode}
                      onChange={(e) => setLoginData({ ...loginData, groupCode: e.target.value.toUpperCase() })}
                      required
                      className="input"
                      placeholder="ABC123"
                      maxLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>사용자명</label>
                    <input
                      type="text"
                      value={loginData.username}
                      onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                      required
                      className="input"
                      placeholder="username"
                    />
                  </div>
                  <div className="form-group">
                    <label>비밀번호</label>
                    <input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                </>
              )}
              <button type="submit" className="btn btn-primary btn-full">로그인</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
