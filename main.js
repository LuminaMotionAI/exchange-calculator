/**
 * 실시간 환율 계산기
 * API: https://open.er-api.com/v6/latest/USD
 */

// Global state
let exchangeRates = null;
let lastUpdate = null;

// DOM Elements
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const fromAmount = document.getElementById('from-amount');
const toAmount = document.getElementById('to-amount');
const swapBtn = document.getElementById('swap-btn');
const updateTimeEl = document.getElementById('update-time');
const conversionRateEl = document.getElementById('conversion-rate');
const rateInfoEl = document.getElementById('rate-info');

// Rate display elements
const rateKRW = document.getElementById('rate-krw');
const rateJPY = document.getElementById('rate-jpy');
const rateEUR = document.getElementById('rate-eur');

/**
 * Fetch exchange rates from API
 */
async function fetchExchangeRates() {
    const API_URL = 'https://open.er-api.com/v6/latest/USD';
    
    try {
        rateInfoEl.classList.add('loading');
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('API 요청 실패');
        }
        
        const data = await response.json();
        
        if (data.result !== 'success') {
            throw new Error('환율 데이터 오류');
        }
        
        exchangeRates = data.rates;
        lastUpdate = new Date();
        
        // Update UI
        updateRateDisplay();
        updateTimeDisplay();
        calculateExchange();
        
        rateInfoEl.classList.remove('loading');
        
        console.log('환율 데이터 업데이트 완료:', exchangeRates);
        
    } catch (error) {
        console.error('환율 가져오기 실패:', error);
        updateTimeEl.textContent = '업데이트 실패';
        rateInfoEl.classList.remove('loading');
        
        // Show error state
        rateKRW.textContent = '오류';
        rateJPY.textContent = '오류';
        rateEUR.textContent = '오류';
    }
}

/**
 * Update rate display in header
 */
function updateRateDisplay() {
    if (!exchangeRates) return;
    
    rateKRW.textContent = formatNumber(exchangeRates.KRW, 2);
    rateJPY.textContent = formatNumber(exchangeRates.JPY, 2);
    rateEUR.textContent = formatNumber(exchangeRates.EUR, 4);
}

/**
 * Update last update time display
 */
function updateTimeDisplay() {
    if (!lastUpdate) return;
    
    const hours = lastUpdate.getHours().toString().padStart(2, '0');
    const minutes = lastUpdate.getMinutes().toString().padStart(2, '0');
    
    updateTimeEl.textContent = `${hours}:${minutes} 업데이트`;
}

/**
 * Calculate and display exchange result
 */
function calculateExchange() {
    if (!exchangeRates) return;
    
    const from = fromCurrency.value;
    const to = toCurrency.value;
    const amount = parseFloat(fromAmount.value) || 0;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / exchangeRates[from];
    const result = amountInUSD * exchangeRates[to];
    
    // Display result with appropriate decimal places
    const decimals = getDecimalPlaces(to);
    toAmount.textContent = formatNumber(result, decimals);
    
    // Update conversion rate info
    const rate = exchangeRates[to] / exchangeRates[from];
    const rateDecimals = getDecimalPlaces(to);
    conversionRateEl.textContent = formatNumber(rate, rateDecimals);
    
    // Update conversion info text
    const conversionInfo = document.getElementById('conversion-info');
    conversionInfo.innerHTML = `<p class="text-xs text-gray-400">1 ${from} = <span id="conversion-rate" class="font-medium text-gray-600">${formatNumber(rate, rateDecimals)}</span> ${to}</p>`;
    
    // Add highlight animation
    toAmount.classList.remove('highlight');
    void toAmount.offsetWidth; // Trigger reflow
    toAmount.classList.add('highlight');
}

/**
 * Get appropriate decimal places for currency
 */
function getDecimalPlaces(currency) {
    switch (currency) {
        case 'KRW':
        case 'JPY':
            return 0; // No decimals for KRW and JPY
        case 'EUR':
        case 'USD':
        default:
            return 2;
    }
}

/**
 * Format number with locale and decimal places
 */
function formatNumber(num, decimals) {
    if (isNaN(num) || num === null) return '--';
    
    return new Intl.NumberFormat('ko-KR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(num);
}

/**
 * Swap currencies
 */
function swapCurrencies() {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;
    
    calculateExchange();
    
    // Rotate animation
    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        swapBtn.style.transform = 'rotate(0deg)';
    }, 300);
}

/**
 * Debounce function for input
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event Listeners
fromCurrency.addEventListener('change', calculateExchange);
toCurrency.addEventListener('change', calculateExchange);
fromAmount.addEventListener('input', debounce(calculateExchange, 100));
swapBtn.addEventListener('click', swapCurrencies);

// Handle enter key
fromAmount.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        fromAmount.blur();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchExchangeRates();
    
    // Refresh rates every 5 minutes
    setInterval(fetchExchangeRates, 5 * 60 * 1000);
});
