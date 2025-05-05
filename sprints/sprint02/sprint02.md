<h1 style="text-align: center;">📌DoR (Definition of Ready): Sprint 02</h1>

<table>
  <thead>
    <tr align="center">
      <th>User Story</th>
      <th>Critério de Aceitação</th>
      <th>Tarefa</th>
    </tr>
  </thead>
  <tbody>
    <tr align="center">
      <td>Como usuário, desejo armazenar informações importantes sobre minha viagem.</td>
      <td>
          O usuário consegue salvar, editar e visualizar informações sobre a viagem, como documentos necessários, contatos de emergência e informações de         
          seguro.
      </td>
      <td>
        Implementar endpoints CRUD para cadastrar dados da viagem.<br>
        Criar formulário para adicionar/editar informações da viagem.<br>
        Exibir lista de informações salvas na tela de detalhes da viagem.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo visualizar no mapa os pontos turísticos e acomodações da minha viagem.</td>
      <td>O mapa exibe marcadores para hotéis e pontos de interesse cadastrados pela viagem.</td>
      <td>
        Integrar componente de mapa.<br>
        Buscar coordenadas de hotéis e itinerários com latitude/longitude.<br>
        Renderizar marcadores no mapa e permitir clicar para detalhes.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo gerenciar dados de transporte como aluguel de carros e transfers.</td>
      <td>O usuário consegue adicionar, editar e remover registros de transporte vinculados como aluguel de carros, transferências e transportes públicos.</td>
      <td>
        Implementar endpoints CRUD para cadastrar dados de transporte.<br>
        Criar formulário para adicionar/editar informações de transporte.<br>
        Exibir lista de informações salvas na tela de detalhes dos transportes.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo acessar dicas sobre o destino da minha viagem.</td>
      <td>O usuário vê uma seção de dicas relevantes ao destino, carregadas dinamicamente.</td>
      <td>
        Integrar API fonte de dicas.<br>
        Criar modal de dicas de destino.<br>
        Buscar e exibir dicas baseado na cidade da viagem.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo monitorar meu orçamento de viagem.</td>
      <td>O sistema calcula e exibe o total de gastos e o compara com um orçamento definido.</td>
      <td>
        Implementar cálculo de soma de despesas (voos, hotéis, itinerários, transportes, seguros).<br>
        Criar card com o valor total da viagem.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo que o app use o GPS para calcular rotas até meus destinos.</td>
      <td>Ao tocar em um marcador, o app traça rota do local atual até o destino no mapa.</td>
      <td>
        Integrar Google Directions API para rotas.<br>
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo sincronizar meus eventos com o calendário do celular.</td>
      <td>O app pede permissão e adiciona eventos de itinerário no calendário nativo.</td>
      <td>
        Usar API de calendário para criar eventos.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo visualizar fusos horários dos destinos da viagem.</td>
      <td>O usuário vê o fuso horário e a hora local de cada destino listado.</td>
      <td>
        Integrar Google Time Zone API.<br>
        Exibir fuso e hora local do hotel na seção de detalhes da viagem.
      </td>
    </tr>
  </tbody>
</table>


<h2>Modelo de dados</h2>
<img src="https://github.com/Ana-Laura-Moratelli/tripWise/blob/main/sprints/sprint02/modelo-de-dados.png">

<h2>DoD (Definition of Done)</h2>

<h2>Mockups</h2>
<img src="https://github.com/Ana-Laura-Moratelli/tripWise/blob/main/assets/c2d01920-9b06-473a-84bb-2c61fa7716af">


