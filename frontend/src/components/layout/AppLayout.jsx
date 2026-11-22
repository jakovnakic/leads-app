import { NavLink, Outlet } from 'react-router-dom';

import styles from '../../styles/components/app-layout.module.scss';

const AppLayout = () => {
  return (
    <div className={styles['app-layout']}>
      <header className={styles['header']}>
        <h1 className={styles['header__brand']}>Leads App</h1>
      </header>
      <div className={styles['app-layout__horizontal-split']}>
        <nav className={styles['navigation']}>
          <NavLink
            to='/'
            end
            className={({ isActive }) =>
              `${styles['navigation__nav-link']} ${
                isActive ? styles['navigation__nav-link--active'] : ''
              }`
            }
          >
            Leads
          </NavLink>

          <NavLink
            to='/scoring-settings'
            className={({ isActive }) =>
              `${styles['navigation__nav-link']} ${
                isActive ? styles['navigation__nav-link--active'] : ''
              }`
            }
          >
            Configuración
          </NavLink>
        </nav>
        <main className={styles['main']}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
