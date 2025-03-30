<h1  align="center" id='topo'>tripWise</h1>

<div align="center">
<a href="#objetivo"> 🎯 Objetivo </a> |
<a href="#product-backlog"> 📖 Product Backlog </a> |
<a href="#dor"> DoR </a> |
<a href="#dod"> DoD </a> |
<a href="#sprints"> 📌 Sprints </a> |
<a href="#tecnologias"> 💻 Tecnologias </a> |
<a href="#como-executar"> :hammer_and_wrench: Como Executar </a> |
</div>

<br>

<h2 id='objetivo'> 🎯 Objetivo </h2>
O App tripWise tem como objetivo facilitar a organização de viagens, permitindo que os usuários planejem itinerários, pesquisem voos e acomodações, criem cronogramas personalizados e gerenciem informações essenciais, como documentos e orçamento. A aplicação busca oferecer uma experiência integrada e intuitiva, auxiliando desde o planejamento até a execução da viagem, garantindo praticidade e segurança.

<br>

<h2 id='product-backlog'> 📖 Product Backlog </h2>

<table>
  <thead>
    <tr align="center">
      <th>Rank</th>
      <th>Prioridade</th>
      <th>User Story</th>
      <th>Critério de Aceitação</th>
      <th>Planning Poker</th>
      <th>Sprint</th>
    </tr>
  </thead>
  <tbody>
    <tr align="center">
      <td>1</td><td>ALTA</td><td>Como usuário, desejo criar uma conta com login e senha utilizando e-mail e senha.</td><td>O usuário consegue se cadastrar e fazer login via e-mail e senha.</td><td>5</td><td>1</td>
    </tr>
    <tr align="center">
      <td>2</td><td>ALTA</td><td>Como usuário, desejo adicionar e gerenciar várias viagens no aplicativo.</td><td>O usuário pode adicionar, editar e excluir viagens.</td><td>5</td><td>1</td>
    </tr>
    <tr align="center">
      <td>3</td><td>ALTA</td><td>Como usuário, desejo planejar viagens com origem, destino e datas.</td><td>O usuário preenche origem, destino e datas ao criar uma viagem.</td><td>3</td><td>1</td>
    </tr>
    <tr align="center">
      <td>4</td><td>ALTA</td><td>Como usuário, desejo pesquisar voos e comparar preços.</td><td>O usuário consegue visualizar diferentes voos e seus preços.</td><td>8</td><td>1</td>
    </tr>
    <tr align="center">
      <td>5</td><td>ALTA</td><td>Como usuário, desejo reservar acomodações diretamente no aplicativo.</td><td>O usuário consegue pesquisar e reservar hotéis.</td><td>8</td><td>1</td>
    </tr>
    <tr align="center">
      <td>6</td><td>ALTA</td><td>Como usuário, desejo criar itinerários com locais e atividades.</td><td>O usuário adiciona atividades com nome, tipo de atividade, local, valor, horário e descrição.</td><td>5</td><td>1</td>
    </tr>
    <tr align="center">
      <td>7</td><td>ALTA</td><td>Como usuário, desejo ver um cronograma com meus compromissos.</td><td>O sistema gera uma lista organizada pela data, baseada nos itinerários.</td><td>5</td><td>1</td>
    </tr>
    <tr align="center">
      <td>8</td><td>ALTA</td><td>Como usuário, desejo compartilhar meu itinerário com outras pessoas.</td><td>O usuário compartilha via e-mail ou redes sociais.</td><td>5</td><td>1</td>
    </tr>
    <tr align="center">
      <td>9</td><td>MÉDIA</td><td>Como usuário, desejo receber alertas e notificações sobre eventos importantes da viagem.</td><td>O sistema envia notificações sobre embarque, check-in e eventos.</td><td>5</td><td>2</td>
    </tr>
    <tr align="center">
      <td>10</td><td>MÉDIA</td><td>Como usuário, desejo armazenar informações importantes sobre minha viagem.</td><td>O usuário consegue registrar documentos, contatos e seguros.</td><td>3</td><td>2</td>
    </tr>
    <tr align="center">
      <td>11</td><td>MÉDIA</td><td>Como usuário, desejo visualizar no mapa os pontos turísticos e acomodações da minha viagem.</td><td>O sistema exibe os locais cadastrados com pins em mapa interativo.</td><td>8</td><td>2</td>
    </tr>
    <tr align="center">
      <td>12</td><td>MÉDIA</td><td>Como usuário, desejo gerenciar dados de transporte como aluguel de carros e transfers.</td><td>O usuário consegue adicionar e visualizar meios de transporte.</td><td>5</td><td>2</td>
    </tr>
    <tr align="center">
      <td>13</td><td>MÉDIA</td><td>Como usuário, desejo acessar dicas sobre o destino da minha viagem.</td><td>O usuário visualiza informações culturais, gastronômicas e cuidados locais.</td><td>3</td><td>2</td>
    </tr>
    <tr align="center">
      <td>14</td><td>MÉDIA</td><td>Como usuário, desejo monitorar meu orçamento de viagem.</td><td>O usuário consegue inserir e acompanhar os custos da viagem.</td><td>8</td><td>2</td>
    </tr>
    <tr align="center">
      <td>15</td><td>BAIXA</td><td>Como usuário, desejo que o app use o GPS para calcular rotas até meus destinos.</td><td>O sistema traça rotas até os locais do itinerário.</td><td>5</td><td>3</td>
    </tr>
    <tr align="center">
      <td>16</td><td>BAIXA</td><td>Como usuário, desejo importar dados de passagens e reservas a partir dos meus e-mails.</td><td>O sistema importa automaticamente reservas de e-mails.</td><td>8</td><td>3</td>
    </tr>
    <tr align="center">
      <td>17</td><td>BAIXA</td><td>Como usuário, desejo adicionar notas e fotos durante minha viagem.</td><td>O usuário consegue registrar textos e imagens por viagem.</td><td>5</td><td>3</td>
    </tr>
    <tr align="center">
      <td>18</td><td>BAIXA</td><td>Como usuário, desejo sincronizar meus eventos com o calendário do celular.</td><td>Os eventos do itinerário aparecem no calendário do dispositivo.</td><td>5</td><td>3</td>
    </tr>
    <tr align="center">
      <td>19</td><td>BAIXA</td><td>Como usuário, desejo visualizar fusos horários dos destinos da viagem.</td><td>O sistema exibe o fuso horário do destino da viagem.</td><td>3</td><td>3</td>
    </tr>
    <tr align="center">
      <td>20</td><td>BAIXA</td><td>Como usuário, desejo que meus dados estejam protegidos com segurança e criptografia.</td><td>Os dados sensíveis são criptografados e protegidos por autenticação.</td><td>5</td><td>3</td>
    </tr>
  </tbody>
</table>

<br>

<h2 id='dor'> DoR (Definitions of Ready) </h2>

### User Stories
- Definidas e compreendidas por todos.
- Pequenas o suficiente para serem feitas em uma sprint.

### Critério de Aceitação
- Mensurável e testável.
- Descreve claramente quando a funcionalidade está completa.

### Tarefas
- Identificadas e documentadas para cada User Story.

### Modelo de Dados
- Definido e documentado.
- Campos, tipos de dados e relações claramente especificados.

<br>

<h2 id='dod'> DoD (Definition of Done) </h2>

### Código
- Implementa todos os critérios de aceitação.
- Todos os testes implementados e executados com sucesso.

### Commit
- Documentados com mensagens claras e descritivas.
- Seguem o padrão de nomenclatura acordado pela equipe.

### Mockups
- Mockups na interface funcionam conforme esperado.
- Experiência do usuário corresponde aos critérios definidos.

### Guia de Instalação
- Detalha todos os passos para configuração e instalação.
- Inclui requisitos de sistema, dependências e configurações de software/hardware.

<br> 

<h2 id='sprints'> 📌 Sprints </h2>

<table>
  <thead>
    <tr align="center">
      <th>Sprints</th>
      <th>Data de Início</th>
      <th>Data de Término</th>
      <th>Documentos</th>
      <th>Status</th>
    </tr>
  </thead>
 <tbody>
  <tr align="center">
    <td>01</td>
    <td>10/03/2025</td>
    <td>30/03/2025</td>
    <td><a href="https://github.com/Ana-Laura-Moratelli/tripWise/blob/main/sprints/sprint01/sprint01.md">Relatório</a></td> 
    <td>✅</td>
  </tr>
  <tr align="center">
    <td>02</td>
    <td>07/04/2025</td>
    <td>27/04/2025</td>
    <td></td> 
    <td>🔄</td>
  </tr>
  <tr align="center">
    <td>03</td>
    <td>05/05/2025</td>
    <td>25/05/2025</td>
    <td></td> 
    <td>🔄</td>
  </tr>
</tbody>
</table>

<br>

<h2 id='tecnologias'> 💻 Tecnologias </h2>

<div>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white&color=5B2FD4" />
  <img src="https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=white&color=5B2FD4" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white&color=5B2FD4" />
</div>

<br>

<h2 id='como-executar'> :hammer_and_wrench: Como executar </h2>

<h3>Passo 1: Clone o Repositório</h3>
<pre><code>git clone https://github.com/Ana-Laura-Moratelli/tripWise </code></pre>

<h3>Passo 2: Instale as dependências</h3>
<p>No frontend e backend:</p>
<pre><code>npm install</code></pre>

<h3>Passo 3: Execute o projeto</h3>
<p>Para iniciar o frontend:</p>
<pre><code>npx expo start</code></pre>
<p>Para iniciar o backend:</p>
<pre><code>npm run dev</code></pre>


<br>

<a href='#topo'> Voltar ao topo </a>
	