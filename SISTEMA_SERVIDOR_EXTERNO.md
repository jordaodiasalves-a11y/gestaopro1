# Sistema de Servidor Externo e Backup Automático

## ✅ Implementações Realizadas

### 1. Cliente API Servidor Externo (`src/api/externalServer.ts`)

**Funcionalidades:**
- ✅ Buscar áudios do servidor HTTP externo
- ✅ Salvar dados no banco externo via REST API
- ✅ Buscar dados do banco externo
- ✅ Atualizar dados no banco externo
- ✅ Deletar dados do banco externo
- ✅ Criar backups automáticos no servidor
- ✅ Sincronizar dados pendentes
- ✅ Fallback automático para localStorage se servidor indisponível

**Endpoints implementados:**
```
http://72.60.246.250:8087/audios/{audio}.mp3
http://72.60.246.250:8087/bancoexterno/{entity}
http://72.60.246.250:8087/bancoexterno/backups/{data}
```

### 2. Sistema de Backup Automático (`src/utils/autoBackup.ts`)

**Funcionalidades:**
- ✅ Backup diário automático (24h)
- ✅ Coleta completa de dados do sistema
- ✅ Salva no servidor externo prioritariamente
- ✅ Fallback para localStorage local
- ✅ Mantém últimos 7 dias de backup
- ✅ Limpeza automática de backups antigos
- ✅ Restauração de backups (servidor ou local)
- ✅ Lista de backups disponíveis

**Dados incluídos no backup:**
```json
{
  "users": [],
  "cash_movements": [],
  "marketplace_orders": [],
  "products_meta": {},
  "settings": {
    "alert_mode": "",
    "marketplace_mode": "",
    ...
  },
  "custom_audios": {}
}
```

### 3. Sincronização Automática (`src/utils/externalServerSync.ts`)

**Funcionalidades:**
- ✅ Sincronização a cada 5 minutos
- ✅ Merge inteligente de dados local/servidor
- ✅ Sincroniza: cash_movements, marketplace_orders, users
- ✅ Detecta e envia dados não sincronizados
- ✅ Inicia backup automático junto

### 4. Usuários Permanentes (`src/contexts/AuthContext.tsx`)

**Usuários admin permanentes:**

1. **admin**
   - Senha: `suporte@1`
   - Role: admin
   - ✅ Nunca pode ser deletado
   - ✅ Recriado automaticamente se removido

2. **salvador**
   - Senha: `salvador123`
   - Role: admin
   - ✅ Nunca pode ser deletado
   - ✅ Recriado automaticamente se removido

**Garantia de persistência:**
- Verificação a cada inicialização do app
- Usuários são restaurados se não existirem
- Propriedade `permanent: true` impede deleção

### 5. Sistema de Áudio Priorizado (`src/contexts/SoundAlertContext.tsx`)

**Ordem de prioridade dos áudios:**

1. **Prioridade 1:** Áudios do servidor externo
   - `novo_pedido.mp3`
   - `estoque_baixo.mp3`
   - `pedido_concluido.mp3`

2. **Prioridade 2:** Áudios customizados locais (upload manual)

3. **Prioridade 3:** Áudios manuais selecionados

4. **Fallback:** Beep do sistema (gerado por AudioContext)

### 6. Interface de Gerenciamento (`src/components/BackupManager.tsx`)

**Funcionalidades da interface:**
- ✅ Visualizar status do último backup
- ✅ Visualizar conexão com servidor externo
- ✅ Criar backup manual
- ✅ Sincronizar dados manualmente
- ✅ Listar backups disponíveis
- ✅ Restaurar backup específico
- ✅ Interface integrada em Configurações > Servidor

### 7. Integração na Página de Configurações

**Nova aba adicionada:**
- "Servidor" - Gerenciamento completo do servidor externo e backups
- Inclui também controle de áudios via `SoundAlertControl`

## 📁 Arquivos Criados

```
src/
├── api/
│   └── externalServer.ts          ✅ Cliente API servidor externo
├── utils/
│   ├── autoBackup.ts              ✅ Sistema de backup automático
│   └── externalServerSync.ts      ✅ Sincronização automática
├── components/
│   ├── BackupManager.tsx          ✅ Interface gerenciamento backup
│   └── SoundAlertAudioManager.tsx (já existente)
└── contexts/
    ├── AuthContext.tsx            ✅ Modificado (usuários permanentes)
    └── SoundAlertContext.tsx      ✅ Modificado (áudios servidor)

Documentação/
├── EXTERNAL_SERVER_CONFIG.md      ✅ Config completa servidor
└── SISTEMA_SERVIDOR_EXTERNO.md    ✅ Este arquivo
```

## 🚀 Como Funciona

### Inicialização do Sistema

No arquivo `src/main.tsx`:
```typescript
import { externalServerSync } from "./utils/externalServerSync";

// Inicia sincronização e backup automático
externalServerSync.startAutoSync();
```

### Fluxo de Dados

```
[Frontend LocalStorage]
       ↕
[Sincronização 5min]
       ↕
[Servidor Externo: http://72.60.246.250:8087]
   ├── /audios/*.mp3
   └── /bancoexterno/*
```

### Quando o servidor está DISPONÍVEL:
1. Dados são salvos simultaneamente no localStorage E no servidor
2. Áudios são tocados do servidor externo
3. Backups são enviados ao servidor
4. Sincronização mantém dados atualizados

### Quando o servidor está INDISPONÍVEL:
1. Dados são salvos APENAS no localStorage
2. Flag `synced: false` marca dados pendentes
3. Áudios tocam versão local (fallback)
4. Backups são salvos localmente
5. Na próxima sincronização bem-sucedida, dados pendentes são enviados

## 🔧 Configuração do Servidor

### Requisitos do Servidor

O servidor em `http://72.60.246.250:8087` deve:

1. **Servir arquivos estáticos** (GET):
```
GET /audios/novo_pedido.mp3
GET /audios/estoque_baixo.mp3
GET /audios/pedido_concluido.mp3
GET /audios/alerta_geral.mp3
```

2. **REST API para dados** (GET, POST, PUT, DELETE):
```
/bancoexterno/cash_movements
/bancoexterno/marketplace_orders
/bancoexterno/users
/bancoexterno/backups
```

3. **Headers CORS** permitindo requisições do frontend

4. **Content-Type: application/json** para endpoints de dados

### Exemplo de Estrutura de Pastas no Servidor

```
/var/www/sistema/
├── audios/
│   ├── novo_pedido.mp3
│   ├── estoque_baixo.mp3
│   ├── pedido_concluido.mp3
│   └── alerta_geral.mp3
└── bancoexterno/
    ├── cash_movements.json
    ├── marketplace_orders.json
    ├── users.json
    └── backups/
        ├── 2025-10-24.json
        ├── 2025-10-25.json
        └── ...
```

## 📊 Monitoramento e Logs

### Console do Navegador

O sistema registra automaticamente:
```
✅ "Sistema de sincronização iniciado"
✅ "Sincronizando com servidor externo..."
✅ "Sincronização concluída"
✅ "Backup criado com sucesso: 2025-10-25"
✅ "Removidos X backups antigos"
⚠️ "Servidor externo indisponível, usando áudio local"
⚠️ "Erro ao salvar no servidor, salvando localmente"
```

### Interface do Usuário

Navegue para: **Configurações > Servidor**

Você verá:
- ✅ Status do último backup
- ✅ Conexão com servidor externo
- ✅ Lista de backups disponíveis
- ✅ Botões para backup/sincronização manual

## 🛠️ Operações Manuais

### Forçar Sincronização

```javascript
import { externalServerSync } from '@/utils/externalServerSync';
await externalServerSync.performSync();
```

### Criar Backup Manual

```javascript
import { autoBackupManager } from '@/utils/autoBackup';
await autoBackupManager.performBackup();
```

### Restaurar Backup

```javascript
import { autoBackupManager } from '@/utils/autoBackup';
await autoBackupManager.restoreBackup('2025-10-25');
```

### Listar Backups Disponíveis

```javascript
import { autoBackupManager } from '@/utils/autoBackup';
const backups = autoBackupManager.listBackups();
console.log(backups); // ['2025-10-25', '2025-10-24', ...]
```

## 🔐 Segurança

### Usuários Permanentes

- Os usuários `admin` e `salvador` são **permanentes**
- Não podem ser deletados via interface
- São restaurados automaticamente a cada inicialização
- Propriedade `permanent: true` os identifica

### Dados Sensíveis

- Senhas são armazenadas em texto plano no localStorage
- **⚠️ ATENÇÃO:** Para produção, implementar hash de senhas
- Backups contêm dados sensíveis - proteger o servidor

## 📝 Manutenção

### Backup Automático
- ✅ Executado diariamente (24h)
- ✅ Mantém 7 dias de histórico
- ✅ Limpeza automática de backups antigos

### Sincronização Automática
- ✅ Executada a cada 5 minutos
- ✅ Envia dados pendentes automaticamente
- ✅ Merge inteligente evita duplicações

### Gestão de Caixa
- ✅ Todos os dados persistem no banco externo
- ✅ Formulário funcional como outros módulos
- ✅ Sincronização automática ativa

## ✨ Recursos Implementados

- [x] Cliente API servidor externo
- [x] Sistema de backup diário automático
- [x] Sincronização automática 5min
- [x] Usuários admin permanentes (admin, salvador)
- [x] Áudios priorizados do servidor HTTP
- [x] Interface gerenciamento backup
- [x] Fallback localStorage completo
- [x] Merge inteligente de dados
- [x] Limpeza automática backups antigos
- [x] Restauração de backups
- [x] Documentação completa
- [x] Integração na página Settings

## 🎯 Próximos Passos (Opcional)

Se desejar expandir o sistema:

1. **Hash de senhas** - Usar bcrypt para senhas
2. **Autenticação API** - Token JWT no servidor externo
3. **Compressão** - Gzip nos dados enviados ao servidor
4. **Retry automático** - Tentar novamente em caso de falha
5. **Notificações** - Push notifications para backups
6. **Dashboard analytics** - Visualizar uso de armazenamento
7. **Multi-tenant** - Suporte para múltiplos clientes

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs do console do navegador
2. Acesse **Configurações > Servidor** para status
3. Verifique conectividade com `http://72.60.246.250:8087`
4. Consulte `EXTERNAL_SERVER_CONFIG.md` para detalhes técnicos

---

**Status:** ✅ Sistema Completo e Operacional
**Data:** 2025-10-25
**Versão:** 1.0.0
