import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import Footer from './components/Footer';
import useFetchRates from './hooks/useFetchRates';
import './App.css';

function App() {
    // Estado principal do aplicativo
    const [selectedOption, setSelectedOption] = useState('0');
    const [formInputs, setFormInputs] = useState({});
    const [results, setResults] = useState(null);

    // Custom Hook para buscar SELIC e IPCA
    const { selicRate, ipcaRate, loadingRates, errorRates } = useFetchRates();

    // Lida com a mudança de opção no dropdown principal
    const handleOptionChange = (event) => {
        const newOption = event.target.value;
        setSelectedOption(newOption);
        setFormInputs({}); // Limpa os inputs ao mudar a opção
        setResults(null); // Limpa os resultados
    };

    // Lida com a mudança em qualquer input do formulário
    const handleInputChange = (event) => {
        const { id, value, type, checked } = event.target;
        setFormInputs(prevInputs => ({
            ...prevInputs,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };

    // Lida com o clique no botão de cálculo
    const handleCalculate = () => {
        // A lógica de cálculo reside em CalculatorForm e ResultsDisplay,
        // mas o App pode ser o ponto central para dispará-la.
        // O `onCalculate` passado para CalculatorForm irá acionar a função de cálculo
        // e passar os resultados de volta.
    };

    return (
        <div className="main-container">
            <Header selicRate={selicRate} ipcaRate={ipcaRate} loading={loadingRates} error={errorRates} />

            <main className="form-container">
                <CalculatorForm
                    selectedOption={selectedOption}
                    onOptionChange={handleOptionChange}
                    onInputChange={handleInputChange}
                    formInputs={formInputs}
                    onCalculate={handleCalculate}
                    selicRate={selicRate}
                    ipcaRate={ipcaRate}
                    setResults={setResults} // Passa a função para o componente de formulário definir os resultados
                />
            </main>
            
            <ResultsDisplay results={results} />

            <Footer />
        </div>
    );
}

export default App;