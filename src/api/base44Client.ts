// Base44 API Client Configuration
const API_BASE_URL = 'https://app.base44.com/api/apps/68f14071a1d645bba1ee65fd';
const API_KEY = '8d3f4b6d3f1b494986e729dba9ef52a5';

interface EntityConfig {
  name: string;
}

class EntityClient {
  constructor(private entityName: string) {}

  async list(orderBy?: string) {
    const url = orderBy 
      ? `${API_BASE_URL}/entities/${this.entityName}?order_by=${orderBy}`
      : `${API_BASE_URL}/entities/${this.entityName}`;
    
    const response = await fetch(url, {
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/entities/${this.entityName}`, {
      method: 'POST',
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/entities/${this.entityName}/${id}`, {
      method: 'PUT',
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/entities/${this.entityName}/${id}`, {
      method: 'DELETE',
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async filter(filters: any) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/entities/${this.entityName}?${queryParams}`, {
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }

  async bulkCreate(data: any[]) {
    const promises = data.map(item => this.create(item));
    return Promise.all(promises);
  }
}

class IntegrationClient {
  async UploadFile({ file }: { file: File }) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/integrations/Core/UploadFile`, {
      method: 'POST',
      headers: {
        'api_key': API_KEY,
      },
      body: formData
    });
    return response.json();
  }

  async ExtractDataFromUploadedFile({ file_url, json_schema }: { file_url: string, json_schema: any }) {
    const response = await fetch(`${API_BASE_URL}/integrations/Core/ExtractDataFromUploadedFile`, {
      method: 'POST',
      headers: {
        'api_key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file_url, json_schema })
    });
    return response.json();
  }
}

export const base44 = {
  entities: {
    Product: new EntityClient('Product'),
    Sale: new EntityClient('Sale'),
    Customer: new EntityClient('Customer'),
    Service: new EntityClient('Service'),
    Contract: new EntityClient('Contract'),
    Material: new EntityClient('Material'),
    Expense: new EntityClient('Expense'),
    ProductionOrder: new EntityClient('ProductionOrder'),
    Supplier: new EntityClient('Supplier'),
    Employee: new EntityClient('Employee'),
    EmployeeDocument: new EntityClient('EmployeeDocument'),
    Invoice: new EntityClient('Invoice'),
    Asset: new EntityClient('Asset'),
  },
  integrations: {
    Core: new IntegrationClient()
  }
};
