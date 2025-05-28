document.addEventListener('DOMContentLoaded', () => {
    // Obtendo referências aos elementos HTML
    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('fromCurrency');
    const toCurrencySelect = document.getElementById('toCurrency');
    const convertBtn = document.getElementById('convertBtn');
    const conversionResult = document.getElementById('conversionResult');

    // URL base da API
    const API_URL = 'https://economia.awesomeapi.com.br/json/last/';

    // Função para realizar a conversão
    async function convertCurrency() {
        const amount = parseFloat(amountInput.value); // Pega o valor digitado e converte para número
        const fromCurrency = fromCurrencySelect.value; // Pega a moeda de origem selecionada
        const toCurrency = toCurrencySelect.value;     // Pega a moeda de destino selecionada

        // Validação básica: verifica se o valor é válido
        if (isNaN(amount) || amount <= 0) {
            conversionResult.textContent = 'Por favor, insira um valor numérico positivo.';
            conversionResult.style.color = 'orange'; // Cor para alerta
            return; // Sai da função
        }

        // Se as moedas de origem e destino forem as mesmas
        if (fromCurrency === toCurrency) {
            conversionResult.textContent = `${amount} ${fromCurrency} = ${amount} ${toCurrency}`;
            conversionResult.style.color = 'darkgreen'; // Cor para sucesso
            return; // Sai da função
        }

        // Construindo o par de moedas para a API
        let currencyPair = '';
        if (fromCurrency === 'BRL') {
            // Se BRL é a origem, a API aceita BRL-MOEDA (ex: BRL-USD)
            currencyPair = `${toCurrency}-${fromCurrency}`; // Inverte para MOEDA-BRL
        } else if (toCurrency === 'BRL') {
            // Se BRL é o destino, a API aceita MOEDA-BRL
            currencyPair = `${fromCurrency}-${toCurrency}`;
        } else {
            // Para outras conversões (USD-EUR, EUR-BTC, etc.)
            // A API awesomeapi.com.br/json/last/:moedas suporta USD-BRL, EUR-BRL, BTC-BRL
            // Mas não diretamente USD-EUR. Precisamos fazer a conversão via BRL.
            // Para simplificar, vamos lidar apenas com pares que envolvem BRL diretamente.
            // Se for um par que não envolve BRL, mostramos uma mensagem.
            conversionResult.textContent = 'Apenas conversões envolvendo BRL são suportadas nesta versão.';
            conversionResult.style.color = 'red';
            return;
        }

        try {
            // Faz a requisição para a API
            const response = await fetch(`${API_URL}${currencyPair}`);
            const data = await response.json();

            // O nome do campo na resposta da API é o mesmo do par de moedas
            // Se currencyPair é 'USD-BRL', o campo na resposta é 'USDBRL'
            const apiDataKey = currencyPair.replace('-', ''); // Remove o hífen para bater com a chave da API

            if (data[apiDataKey]) {
                // Pega a taxa de câmbio (usando 'high' como a taxa de compra)
                let exchangeRate = parseFloat(data[apiDataKey].high);
                let convertedAmount;

                // A API fornece X-BRL. Se for BRL-X, precisamos dividir.
                if (fromCurrency === 'BRL') {
                    convertedAmount = (amount / exchangeRate).toFixed(2); // Se 1 USD = 5 BRL, então 5 BRL = 1 USD
                } else {
                    convertedAmount = (amount * exchangeRate).toFixed(2); // Se 1 USD = 5 BRL, então 10 USD = 50 BRL
                }

                conversionResult.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;
                
                conversionResult.style.color = '#00401A';
            } else {
                conversionResult.textContent = `Não foi possível encontrar a taxa para ${fromCurrency}-${toCurrency}.`;
                conversionResult.style.color = 'red';
            }

        } catch (error) {
            console.error('Erro ao converter moeda:', error);
            conversionResult.textContent = 'Erro ao converter. Verifique sua conexão ou tente novamente.';
            conversionResult.style.color = 'red';
        }
    }

    // Adicionando o "ouvinte" de evento ao botão
    convertBtn.addEventListener('click', convertCurrency);

    // Não precisamos mais chamar fetchAndPopulateCurrencies(),
    // pois as opções estão fixas no HTML.
});