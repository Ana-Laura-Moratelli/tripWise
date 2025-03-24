import axios from 'axios';

// Crie um objeto URLSearchParams para formatar o corpo da requisição
const data = new URLSearchParams();
data.append('grant_type', 'client_credentials');
data.append('client_id', 'Udxk5ANHpnOfCvd4TKPkJ7IyzK6fKGaZ'); // substitua pela sua API Key
data.append('client_secret', 'YMxDB5GRuyRN1Gvq'); // substitua pela sua API Secret

axios.post('https://test.api.amadeus.com/v1/security/oauth2/token', data, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  }
})
.then(response => {
  console.log("Token recebido:", response.data);
})
.catch(error => {
  // Exibe detalhes do erro se houver
  console.error("Erro ao obter token:", error.response ? error.response.data : error.message);
});
