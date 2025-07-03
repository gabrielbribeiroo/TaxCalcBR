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
    if (!results) {
        return (
            <section id="resultado" className="resultado" ref={resultRef}>
                <p className="placeholder-text">Os resultados da sua simulação aparecerão aqui.</p>
            </section>
        );
    }

    // Usa dangerouslySetInnerHTML para renderizar o HTML gerado pelas funções de cálculo.
    // Em um projeto React ideal, a tabela seria construída com JSX, mas para compatibilidade
    // com a sua lógica JS existente, esta é a forma mais direta de traduzir.
    return (
        <section id="resultado" className="resultado" ref={resultRef} dangerouslySetInnerHTML={{ __html: results }}></section>
    );
};

export default ResultsDisplay;