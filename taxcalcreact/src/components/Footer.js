import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <p>Desenvolvido por Gabriel Ribeiro | &copy; 2025</p>
            <div className="social-links">
                <a href="https://www.github.com/gabrielbribeiroo/" target="_blank" rel="noopener noreferrer" aria-label="Visite meu perfil no GitHub">
                    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg" alt="Ícone GitHub" width="30" height="30" />
                </a>
                <a href="mailto:gabrielbroliveira@gmail.com" aria-label="Envie um e-mail para gabrielbroliveira@gmail.com">
                    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/google/google-original.svg" alt="Ícone Gmail" width="30" height="30" />
                </a>
                <a href="https://www.instagram.com/gabrielbribeiroo/" target="_blank" rel="noopener noreferrer" aria-label="Visite meu perfil no Instagram">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Ícone Instagram" style={{ width: '32px', height: '32px' }} />
                </a>
                <a href="https://www.linkedin.com/in/gabriel-ribeiro1000/" target="_blank" rel="noopener noreferrer" aria-label="Visite meu perfil no LinkedIn">
                    <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/linkedin/linkedin-original.svg" alt="Ícone LinkedIn" width="30" height="30" />
                </a>
            </div>
        </footer>
    );
};

export default Footer;