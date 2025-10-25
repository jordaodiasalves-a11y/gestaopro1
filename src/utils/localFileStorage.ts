// Sistema de armazenamento local de arquivos (imagens, áudios, etc)
// Converte arquivos para base64 e armazena no localStorage

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  data: string; // base64
  size: number;
  uploadedAt: string;
}

const STORAGE_KEY_PREFIX = 'local_file_';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limite

/**
 * Converte arquivo para base64 e salva no localStorage
 */
export async function saveFileLocally(file: File, customId?: string): Promise<StoredFile> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const base64Data = reader.result as string;
        const storedFile: StoredFile = {
          id: customId || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type,
          data: base64Data,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        };

        const key = `${STORAGE_KEY_PREFIX}${storedFile.id}`;
        localStorage.setItem(key, JSON.stringify(storedFile));
        
        resolve(storedFile);
      } catch (error) {
        reject(new Error('Erro ao salvar arquivo. Espaço insuficiente.'));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Recupera arquivo do localStorage
 */
export function getLocalFile(fileId: string): StoredFile | null {
  try {
    const key = `${STORAGE_KEY_PREFIX}${fileId}`;
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Remove arquivo do localStorage
 */
export function deleteLocalFile(fileId: string): boolean {
  try {
    const key = `${STORAGE_KEY_PREFIX}${fileId}`;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lista todos os arquivos armazenados
 */
export function listLocalFiles(filterType?: string): StoredFile[] {
  const files: StoredFile[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const file = JSON.parse(stored);
          if (!filterType || file.type.startsWith(filterType)) {
            files.push(file);
          }
        }
      } catch {}
    }
  }
  
  return files.sort((a, b) => 
    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

/**
 * Calcula espaço usado no localStorage
 */
export function getStorageUsage(): { used: number; total: number; percentage: number } {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        used += key.length + value.length;
      }
    }
  }
  
  const total = 5 * 1024 * 1024; // Aproximadamente 5MB
  const percentage = (used / total) * 100;
  
  return { used, total, percentage };
}

/**
 * Limpa arquivos antigos (mais de 30 dias)
 */
export function cleanOldFiles(daysOld: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  let deletedCount = 0;
  const files = listLocalFiles();
  
  files.forEach(file => {
    if (new Date(file.uploadedAt) < cutoffDate) {
      if (deleteLocalFile(file.id)) {
        deletedCount++;
      }
    }
  });
  
  return deletedCount;
}
