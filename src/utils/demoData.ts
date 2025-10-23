import { base44 } from "@/api/base44Client";

export const createDemoData = async () => {
  try {
    // Produtos demo - CAMPOS CORRIGIDOS
    const demoProducts = [
      {
        product_name: "Cadeira Gamer Pro",
        variation_name: "Preta com LED RGB",
        components: [], // API espera array
        material_cost: 250.00,
        labor_cost: 80.00,
        other_costs: 0,
        sale_price: 899.90,
        stock_quantity: 15,
        total_cost: 330.00,
        profit_margin: 63.33
      },
      {
        product_name: "Mesa para Escritório",
        variation_name: "Madeira MDF 120x60cm",
        components: [],
        material_cost: 180.00,
        labor_cost: 50.00,
        other_costs: 0,
        sale_price: 549.90,
        stock_quantity: 8,
        total_cost: 230.00,
        profit_margin: 58.17
      },
      {
        product_name: "Estante Modular",
        variation_name: "6 prateleiras - Branca",
        components: [],
        material_cost: 120.00,
        labor_cost: 40.00,
        other_costs: 0,
        sale_price: 399.90,
        stock_quantity: 12,
        total_cost: 160.00,
        profit_margin: 60.00
      }
    ];

    // Clientes demo
    const demoCustomers = [
      {
        name: "João Silva",
        email: "joao.silva@email.com",
        phone: "(11) 98765-4321",
        address: "Rua das Flores, 123 - São Paulo, SP",
        notes: "Cliente VIP - desconto 10%"
      },
      {
        name: "Maria Santos",
        email: "maria.santos@email.com",
        phone: "(21) 97654-3210",
        address: "Av. Principal, 456 - Rio de Janeiro, RJ",
        notes: "Prefere pagamento à vista"
      },
      {
        name: "Tech Solutions Ltda",
        email: "contato@techsolutions.com",
        phone: "(11) 3456-7890",
        address: "Rua Comercial, 789 - São Paulo, SP",
        notes: "Empresa - Pedidos recorrentes"
      }
    ];

    // Fornecedores demo - CAMPOS CORRIGIDOS
    const demoSuppliers = [
      {
        name: "Madeiras Brasil Ltda",
        cnpj: "12.345.678/0001-90",
        contact_person: "Carlos Mendes",
        email: "vendas@madeirasbrasil.com",
        phone: "(11) 4567-8901",
        address: "Av. Industrial, 1000 - São Paulo, SP",
        notes: "Fornecedor principal de MDF"
      },
      {
        name: "Ferragens & Metais",
        cnpj: "98.765.432/0001-01",
        contact_person: "Ana Paula",
        email: "contato@ferragensmetais.com",
        phone: "(11) 4321-0987",
        address: "Rua das Indústrias, 500 - Guarulhos, SP",
        notes: "Pés de metal e estruturas"
      }
    ];

    // Funcionários demo - CAMPOS CORRIGIDOS
    const demoEmployees = [
      {
        name: "Pedro Oliveira",
        full_name: "Pedro Oliveira",
        position: "Marceneiro Senior",
        cpf: "123.456.789-00",
        rg: "12.345.678-9",
        pis: "123.45678.90-1",
        email: "pedro.oliveira@empresa.com",
        phone: "(11) 91234-5678",
        salary: 3500.00,
        admission_date: "2022-01-15",
        address: "Rua A, 100 - São Paulo, SP",
        emergency_contact: "(11) 91234-0000",
        notes: "Especialista em móveis planejados"
      },
      {
        name: "Juliana Costa",
        full_name: "Juliana Costa",
        position: "Designer",
        cpf: "987.654.321-00",
        rg: "98.765.432-1",
        pis: "987.65432.10-1",
        email: "juliana.costa@empresa.com",
        phone: "(11) 91234-5679",
        salary: 4000.00,
        admission_date: "2021-06-01",
        address: "Rua B, 200 - São Paulo, SP",
        emergency_contact: "(11) 91234-1111",
        notes: "Responsável pelos projetos customizados"
      }
    ];

    // Materiais demo - CAMPOS CORRIGIDOS
    const demoMaterials = [
      {
        material_name: "Chapa MDF 18mm",
        category: "materia_prima",
        unit: "metro",
        supplier: "Madeiras Brasil Ltda",
        quantity: 50,
        minimum_quantity: 20,
        unit_cost: 85.00,
        location: "Galpão A",
        notes: "Cor branca texturizada"
      },
      {
        material_name: "Pé de Metal para Mesa",
        category: "componente",
        unit: "unidade",
        supplier: "Ferragens & Metais",
        quantity: 30,
        minimum_quantity: 15,
        unit_cost: 25.00,
        location: "Almoxarifado",
        notes: "Altura regulável 70-75cm"
      },
      {
        material_name: "Dobradiça de Aço",
        category: "componente",
        unit: "unidade",
        supplier: "Ferragens & Metais",
        quantity: 100,
        minimum_quantity: 50,
        unit_cost: 3.50,
        location: "Almoxarifado",
        notes: "Modelo invisível"
      }
    ];

    // Despesas demo - CAMPOS CORRIGIDOS
    const demoExpenses = [
      {
        description: "Energia Elétrica",
        category: "fixo",
        value: 850.00,
        payment_date: new Date().toISOString().split('T')[0],
        notes: "Conta mensal da fábrica"
      },
      {
        description: "Aluguel do Galpão",
        category: "fixo",
        value: 3500.00,
        payment_date: new Date().toISOString().split('T')[0],
        notes: "Aluguel mensal"
      }
    ];

    // Criar produtos
    console.log("Criando produtos demo...");
    await base44.entities.Product.bulkCreate(demoProducts);
    
    // Criar clientes
    console.log("Criando clientes demo...");
    await base44.entities.Customer.bulkCreate(demoCustomers);
    
    // Criar fornecedores
    console.log("Criando fornecedores demo...");
    await base44.entities.Supplier.bulkCreate(demoSuppliers);
    
    // Criar funcionários
    console.log("Criando funcionários demo...");
    await base44.entities.Employee.bulkCreate(demoEmployees);
    
    // Criar materiais
    console.log("Criando materiais demo...");
    await base44.entities.Material.bulkCreate(demoMaterials);
    
    // Criar despesas
    console.log("Criando despesas demo...");
    await base44.entities.Expense.bulkCreate(demoExpenses);

    // Aguardar um pouco e criar vendas e serviços
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Buscar produtos e clientes criados
    const products = await base44.entities.Product.list();
    const customers = await base44.entities.Customer.list();

    if (products.length > 0 && customers.length > 0) {
      const demoSales = [
        {
          product_id: products[0].id,
          product_name: `${products[0].product_name} - ${products[0].variation_name}`,
          unit_cost: products[0].total_cost,
          unit_price: products[0].sale_price,
          quantity: 2,
          total_revenue: products[0].sale_price * 2,
          total_cost: products[0].total_cost * 2,
          total_profit: (products[0].sale_price - products[0].total_cost) * 2,
          customer_name: customers[0].name,
          sale_date: new Date().toISOString().split('T')[0],
          notes: "Venda de inauguração"
        },
        {
          product_id: products[1]?.id || products[0].id,
          product_name: products[1] ? `${products[1].product_name} - ${products[1].variation_name}` : `${products[0].product_name} - ${products[0].variation_name}`,
          unit_cost: products[1]?.total_cost || products[0].total_cost,
          unit_price: products[1]?.sale_price || products[0].sale_price,
          quantity: 1,
          total_revenue: products[1]?.sale_price || products[0].sale_price,
          total_cost: products[1]?.total_cost || products[0].total_cost,
          total_profit: (products[1]?.sale_price || products[0].sale_price) - (products[1]?.total_cost || products[0].total_cost),
          customer_name: customers[1]?.name || customers[0].name,
          sale_date: new Date().toISOString().split('T')[0],
          notes: "Cliente novo"
        }
      ];

      console.log("Criando vendas demo...");
      await base44.entities.Sale.bulkCreate(demoSales);
    }

    // Serviços demo
    const demoServices = [
      {
        service_name: "Montagem de Móveis",
        service_type: "hora_maquina",
        machine_name: "Parafusadeira Elétrica",
        client_name: customers[0]?.name || "Cliente Demo",
        hourly_rate: 80.00,
        hours_worked: 3,
        total_value: 240.00,
        service_date: new Date().toISOString().split('T')[0],
        notes: "Montagem completa"
      },
      {
        service_name: "Manutenção Preventiva",
        service_type: "manutencao",
        machine_name: "Serra Circular",
        client_name: customers[1]?.name || "Cliente Demo 2",
        hourly_rate: 100.00,
        hours_worked: 2,
        total_value: 200.00,
        service_date: new Date().toISOString().split('T')[0],
        notes: "Revisão trimestral"
      }
    ];

    console.log("Criando serviços demo...");
    await base44.entities.Service.bulkCreate(demoServices);

    return { success: true, message: "Dados demo criados com sucesso!" };
  } catch (error) {
    console.error("Erro ao criar dados demo:", error);
    return { success: false, message: "Erro ao criar dados demo", error };
  }
};
