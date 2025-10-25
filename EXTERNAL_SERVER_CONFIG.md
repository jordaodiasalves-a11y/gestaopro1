# Configuração do Servidor Externo

## Servidor HTTP Externo
**Base URL:** `http://72.60.246.250:8087`

## Estrutura de Diretórios

### 1. Áudios (`/audios`)
Diretório contendo arquivos de áudio para alertas do sistema:

- `novo_pedido.mp3` - Alerta de novo pedido
- `estoque_baixo.mp3` - Alerta de estoque baixo
- `pedido_concluido.mp3` - Alerta de pedido concluído
- `alerta_geral.mp3` - Alerta geral

**URL de acesso:** `http://72.60.246.250:8087/audios/{nome_do_arquivo}.mp3`

### 2. Banco de Dados Externo (`/bancoexterno`)
Diretório contendo endpoints para armazenamento de dados:

#### Endpoints disponíveis:

**Movimentos de Caixa:**
- GET `/bancoexterno/cash_movements` - Listar todos
- POST `/bancoexterno/cash_movements` - Criar novo
- PUT `/bancoexterno/cash_movements/{id}` - Atualizar
- DELETE `/bancoexterno/cash_movements/{id}` - Deletar

**Pedidos Marketplace:**
- GET `/bancoexterno/marketplace_orders` - Listar todos
- POST `/bancoexterno/marketplace_orders` - Criar novo
- PUT `/bancoexterno/marketplace_orders/{id}` - Atualizar
- DELETE `/bancoexterno/marketplace_orders/{id}` - Deletar

**Usuários:**
- GET `/bancoexterno/users` - Listar todos
- POST `/bancoexterno/users` - Criar novo
- PUT `/bancoexterno/users/{username}` - Atualizar
- DELETE `/bancoexterno/users/{username}` - Deletar

**Backups:**
- GET `/bancoexterno/backups/{data}` - Obter backup específico
- POST `/bancoexterno/backups/{data}` - Criar backup
- GET `/bancoexterno/backups` - Listar todos os backups

## Funcionalidades Implementadas

### 1. Sistema de Áudio
- **Prioridade 1:** Áudios do servidor externo
- **Prioridade 2:** Áudios customizados locais (upload)
- **Prioridade 3:** Áudios manuais selecionados
- **Fallback:** Beep do sistema

### 2. Sincronização Automática
- Sincronização a cada 5 minutos
- Fallback para localStorage se servidor indisponível
- Merge inteligente de dados local e servidor

### 3. Backup Automático Diário
- Backup criado automaticamente todos os dias
- Armazenado no servidor: `/bancoexterno/backups/{YYYY-MM-DD}`
- Fallback para backup local se servidor indisponível
- Mantém últimos 7 dias de backup

### 4. Dados Sincronizados
- Movimentos de caixa
- Pedidos marketplace
- Usuários (exceto permanentes)
- Configurações do sistema
- Áudios customizados

## Usuários Permanentes

Os seguintes usuários são **permanentes** e sempre existirão no sistema:

1. **admin**
   - Senha: `suporte@1`
   - Role: admin
   - Não pode ser deletado

2. **salvador**
   - Senha: `salvador123`
   - Role: admin
   - Não pode ser deletado

Estes usuários são recriados/atualizados automaticamente a cada inicialização do app.

## Estrutura de Backup

```json
{
  "timestamp": "2025-10-25T00:00:00.000Z",
  "data": {
    "users": [...],
    "cash_movements": [...],
    "marketplace_orders": [...],
    "products_meta": {...},
    "settings": {
      "alert_mode": "on-order",
      "marketplace_mode": "teste",
      ...
    },
    "custom_audios": {
      "manual_audio_alerta1": "base64...",
      ...
    }
  }
}
```

## Logs e Monitoramento

O sistema registra logs no console do navegador:
- Sucesso/falha de sincronizações
- Backups criados
- Áudios carregados
- Erros de conexão

## Fallback e Resiliência

Se o servidor externo estiver **indisponível**:
1. Todos os dados são salvos em `localStorage`
2. Flag `synced: false` marca dados não sincronizados
3. Na próxima sincronização bem-sucedida, dados pendentes são enviados
4. Backups são salvos localmente com prefixo `backup_{data}`

## Manutenção

### Limpeza Automática
- Backups antigos (>7 dias) são removidos automaticamente
- Executado a cada novo backup diário

### Sincronização Manual
Para forçar uma sincronização:
```javascript
import { externalServerSync } from '@/utils/externalServerSync';
await externalServerSync.performSync();
```

### Backup Manual
Para criar um backup imediato:
```javascript
import { autoBackupManager } from '@/utils/autoBackup';
await autoBackupManager.performBackup();
```

### Restaurar Backup
Para restaurar um backup específico:
```javascript
import { autoBackupManager } from '@/utils/autoBackup';
await autoBackupManager.restoreBackup('2025-10-25');
```

## Configuração do Servidor

Para que o sistema funcione corretamente, o servidor em `http://72.60.246.250:8087` deve:

1. **Servir arquivos estáticos** do diretório `/audios`
2. **Implementar endpoints REST** em `/bancoexterno` conforme documentado
3. **Permitir CORS** para requisições do frontend
4. **Retornar JSON** para endpoints de dados
5. **Aceitar POST/PUT** com body JSON

## Estrutura de Pastas no Servidor

```
/var/www/sistema/
├── audios/
│   ├── novo_pedido.mp3
│   ├── estoque_baixo.mp3
│   ├── pedido_concluido.mp3
│   └── alerta_geral.mp3
└── bancoexterno/
    ├── cash_movements/
    ├── marketplace_orders/
    ├── users/
    └── backups/
        ├── 2025-10-24/
        ├── 2025-10-25/
        └── ...
```
