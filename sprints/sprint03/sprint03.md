<h1 style="text-align: center;">📌DoR (Definition of Ready): Sprint 03</h1>

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
      <td>Como usuário, desejo receber alertas e notificações sobre eventos importantes da viagem.</td>
      <td>O usuário recebe notificações automáticas com antecedência configurada sobre voos, hotéis, check-ins e passeios.</td>
      <td>
        Solicitar permissões de notificação no app.<br>
        Configurar notificações locais com base nas datas da viagem.<br>
        Implementar backend com lógica para agendar notificações automáticas.<br>
        Integrar com Expo Notifications.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo importar dados de passagens e reservas a partir dos meus e-mails.</td>
      <td>O sistema lê e extrai informações de e-mails encaminhados para o app e registra os dados de forma automática no perfil do usuário.</td>
      <td>
        Configurar serviço de leitura de e-mails recebidos.<br>
        Implementar parser de informações (voos e hotéis) a partir de e-mails.<br>
        Salvar os dados importados na base de dados com <code>origem: "Importados"</code>.<br>
        Associar a viagem importada ao e-mail do usuário autenticado.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo adicionar notas e fotos durante minha viagem.</td>
      <td>O usuário consegue registrar fotos e textos associados a datas ou locais específicos da viagem.</td>
      <td>
        Criar CRUD de notas com título, descrição e imagem.<br>
        Associar notas a um ponto da viagem (data ou local).<br>
        Permitir upload de imagens com visualização na galeria da viagem.<br>
        Exibir notas no painel de detalhes da viagem.
      </td>
    </tr>
    <tr align="center">
      <td>Como usuário, desejo que meus dados estejam protegidos com segurança e criptografia.</td>
      <td>As informações do usuário são armazenadas com criptografia, e os acessos exigem autenticação com token seguro.</td>
      <td>
        Implementar autenticação JWT no backend.<br>
        Criptografar senhas com bcrypt.<br>
        Validar tokens em endpoints protegidos.<br>
        Garantir que dados sensíveis não sejam expostos no frontend.
      </td>
    </tr>
  </tbody>
</table>

<h2>Modelo de dados</h2>
<img src="https://github.com/Ana-Laura-Moratelli/tripWise/blob/main/sprints/sprint02/modelo-de-dados.png">

<h2>DoD (Definition of Done)</h2>

<h2>Mockups</h2>
<img src="https://github.com/Ana-Laura-Moratelli/tripWise/blob/main/assets/d2553f66-2bb7-434c-b63d-a01ec39de9dd">


