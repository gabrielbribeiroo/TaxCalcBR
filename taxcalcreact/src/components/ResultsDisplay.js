import React, { useEffect, useRef } from 'react';

const ResultsDisplay = ({ results }) => {
    const resultRef = useRef(null);

    // Scroll suave para o resultado quando ele aparece
    useEffect(() => {
        if (results && resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [results]);

    // Exibe um placeholder se não houver resultados
    if (results === null) { // Altere de !results para results === null para lidar com string vazia vs null
        return (
            <section id="resultado" className="resultado" ref={resultRef}>
                <p className="placeholder-text">Os resultados da sua simulação aparecerão aqui.</p>
            </section>
        );
    }

    // Se `results` for uma string (HTML), renderize-a.
    // Em um projeto React ideal, a tabela seria construída com JSX, mas para compatibilidade
    // com a sua lógica JS existente, esta é a forma mais direta de traduzir.
    return (
        <section id="resultado" className="resultado" ref={resultRef} dangerouslySetInnerHTML={{ __html: results }}></section>
    );
};

export default ResultsDisplay;