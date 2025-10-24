# Guia do Sistema de Pedidos Marketplace

## ✅ Sistema Completo Implementado

### 🎯 Recursos Principais

1. **Modo Teste/Produção**
   - Alterne entre ambiente de teste e produção
   - Modo Teste: usa pedidos fake para desenvolvimento
   - Modo Produção: conecta com APIs reais das integrações

2. **Importação de Pedidos Fake (Modo Teste)**
   - Bling
   - Tiny
   - Shopee
   - Mercado Livre
   - AliExpress
   - TikTok
   - Shein

3. **Sincronização Automática**
   - Pedidos aparecem automaticamente nos monitores de Produção e Gestão
   - Atualização em tempo real a cada 5 segundos
   - Som de alerta quando novos pedidos chegam

4. **Gestão Completa**
   - Registro manual de pedidos
   - Marcar pedidos como separados
   - Histórico de pedidos concluídos
   - Limpeza de pedidos antigos

## 📱 Como Usar

### Na Página de Pedidos Marketplace

1. **Alternar Modo**
   - Clique em "Modo Teste/Produção"
   - Clique em "Alternar Modo" para mudar entre teste e produção

2. **Gerar Pedidos de Teste**
   - No painel de configurações (modo teste)
   - Clique no botão da integração desejada
   - 3 pedidos fake serão criados automaticamente

3. **Importar Pedidos**
   - Selecione a integração no dropdown
   - Clique em "Importar Pedidos"
   - Em modo teste: gera 3 pedidos fake
   - Em modo produção: conecta com API real (requer configuração)

4. **Registrar Pedido Manual**
   - Clique em "Registrar Pedido Manual"
   - Preencha número do pedido e cliente
   - Adicione itens (produto, quantidade, localização)
   - Clique em "Registrar Pedido"

5. **Marcar Pedido como Separado**
   - Marque o checkbox no pedido
   - Digite seu nome para confirmar
   - Pedido vai para "Concluídos Hoje"

### Nos Monitores (Produção e Gestão)

Os pedidos aparecem automaticamente na rotação dos monitores:
- Exibidos com destaque em cards roxos
- Mostram número do pedido, cliente e itens
- Som de alerta quando novos pedidos chegam
- Atualização automática a cada 5 segundos

## 🔧 Persistência de Dados

Todos os dados são salvos em localStorage:
- `marketplace_orders`: Lista de todos os pedidos
- `marketplace_mode`: Modo atual (teste/produção)
- `app_users`: Usuários do sistema
- `cash_movements`: Movimentações de caixa
- Produtos (via Base44 API)

## 🔔 Alertas Sonoros

Configure os alertas em:
- MarketplaceOrders: Botão "Controles" (top right)
- Monitores: Botão "Controles"

Modos disponíveis:
- Desligado
- Ao chegar pedido
- A cada intervalo (minutos)

## 🧹 Manutenção

**Limpar Todos os Pedidos:**
- Na página Marketplace Orders
- Clique em "Modo Teste/Produção"
- Clique em "Limpar Todos os Pedidos"
- Confirme a ação

**Normalização Automática:**
O sistema automaticamente:
- Valida estrutura dos pedidos
- Normaliza campos para compatibilidade
- Remove duplicatas de campos (created_date/created_at)
- Garante que todos os pedidos têm IDs únicos

## 📊 Estatísticas

Use a função `getOrderStats()` do arquivo `marketplaceSync.ts`:
- Total de pedidos
- Pedidos pendentes
- Pedidos em separação
- Pedidos concluídos

## 🚀 Próximos Passos (Modo Produção)

Para usar em produção:
1. Configure credenciais de API em IntegrationConfig
2. Implemente chamadas reais às APIs das integrações
3. Alterne para "Modo Produção"
4. Importe pedidos reais

## 💾 Backup de Dados

Para fazer backup:
```javascript
// No console do navegador
const backup = {
  orders: localStorage.getItem('marketplace_orders'),
  users: localStorage.getItem('app_users'),
  cash: localStorage.getItem('cash_movements'),
  mode: localStorage.getItem('marketplace_mode')
};
console.log(JSON.stringify(backup));
// Copie o resultado
```

Para restaurar:
```javascript
// Cole o backup
const backup = { /* seu backup aqui */ };
Object.entries(backup).forEach(([key, value]) => {
  if (value) localStorage.setItem(key, value);
});
location.reload();
```

## ✨ Recursos Adicionais

- Som personalizado por pedido (configurável)
- Rotação automática nos monitores
- Filtros por status
- Busca por cliente ou número de pedido
- Exportação de relatórios (futuro)

---

**Desenvolvido com ❤️ para gestão eficiente de pedidos marketplace**
