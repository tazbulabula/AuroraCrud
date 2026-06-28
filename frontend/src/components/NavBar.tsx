import React from 'react';
import {Link} from 'react-router-dom';


interface NavBarProps {
  children: React.ReactNode;
}
const NavBar: React.FC <NavBarProps>= (children) => {
  return <><nav style={{
          padding: '15px',
          backgroundColor: '#f0f0f0',
          marginBottom: '20px',
          display: 'flex',
          gap: '20px'
        }}>
          <Link to="/">Home</Link>
          <Link to="/clientes">Clientes</Link>
          <Link to="/produtos">Produtos</Link>
          <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium ml-auto">
              Login
            </Link>
        </nav>

        <div>
            {children}
        </div>
        
        </>
  
  
};

export default NavBar;

