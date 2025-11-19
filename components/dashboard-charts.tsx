"use client";

import { Obra } from "@/lib/types";
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface DashboardChartsProps {
  obras: Obra[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string } }>;
}

const CustomTooltip = (props: CustomTooltipProps) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    };
    return (
      <div
        style={{
          backgroundColor: '#1E1E1E',
          border: '2px solid #F5C800',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '13px',
        }}
      >
        <p style={{ color: '#F5C800', fontWeight: 'bold', margin: 0 }}>
          {payload[0].payload.name}
        </p>
        <p style={{ color: '#F5C800', fontWeight: 'bold', margin: '4px 0 0 0' }}>
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomTooltipPie = (props: CustomTooltipProps) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: '#1E1E1E',
          border: '2px solid #F5C800',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '13px',
        }}
      >
        <p style={{ color: '#F5C800', fontWeight: 'bold', margin: 0 }}>
          {payload[0].payload.name}
        </p>
        <p style={{ color: '#F5C800', fontWeight: 'bold', margin: '4px 0 0 0' }}>
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ obras }: DashboardChartsProps) {
  const COLORS = {
    emAndamento: '#E53935',
    finalizado: '#22C55E',
    pendente: '#3B82F6',
    yellow: '#F5C800',
  };

  // Faturamento por Status
  const faturamentoPorStatus = obras.reduce((acc, obra) => {
    const status = obra.status || 'PENDENTE';
    const existing = acc.find(item => item.name === status);
    const valor = Number(obra.valor_total) || 0;
    if (existing) {
      existing.value += valor;
    } else {
      acc.push({ 
        name: status === 'EM ANDAMENTO' ? 'EM ANDAMENTO' : status === 'FINALIZADO' ? 'FINALIZADO' : 'PENDENTE',
        value: valor 
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const faturamentoPorStatusOrdenado = [
    faturamentoPorStatus.find(f => f.name === 'EM ANDAMENTO') || { name: 'EM ANDAMENTO', value: 0 },
    faturamentoPorStatus.find(f => f.name === 'FINALIZADO') || { name: 'FINALIZADO', value: 0 },
    faturamentoPorStatus.find(f => f.name === 'PENDENTE') || { name: 'PENDENTE', value: 0 },
  ];

  // Obras por Status
  const obrasPorStatus = obras.reduce((acc, obra) => {
    const status = obra.status || 'PENDENTE';
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const obrasPorStatusOrdenado = [
    obrasPorStatus.find(o => o.name === 'EM ANDAMENTO') || { name: 'EM ANDAMENTO', value: 0 },
    obrasPorStatus.find(o => o.name === 'FINALIZADO') || { name: 'FINALIZADO', value: 0 },
    obrasPorStatus.find(o => o.name === 'PENDENTE') || { name: 'PENDENTE', value: 0 },
  ];

  // Faturamento por Ano (não utilizado - mantém compatibilidade)

  // Obras por Ano
  const obrasPorAno = (() => {
    // Agrupar obras por ano_obra
    const obrasPorAnoMap: { [key: number]: number } = {};
    
    obras.forEach((obra) => {
      // Usar ano_obra se existir, senão usar o ano do created_at
      const ano = obra.ano_obra || new Date(obra.created_at || new Date()).getFullYear();
      
      if (!obrasPorAnoMap[ano]) {
        obrasPorAnoMap[ano] = 0;
      }
      obrasPorAnoMap[ano] += 1;
    });

    // Filtrar apenas anos com mais de 5 obras e ordenar
    return Object.keys(obrasPorAnoMap)
      .map(Number)
      .filter(ano => obrasPorAnoMap[ano] > 5)
      .sort((a, b) => a - b)
      .map(ano => ({
        ano,
        quantidade: obrasPorAnoMap[ano]
      }));
  })();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const getBarColor = (name: string) => {
    if (name === 'EM ANDAMENTO') return COLORS.emAndamento;
    if (name === 'FINALIZADO') return COLORS.finalizado;
    return COLORS.pendente;
  };

  const getPieColors = () => [COLORS.emAndamento, COLORS.finalizado, COLORS.pendente];

  const gerarDadosComProjecao = () => {
    // Agrupar obras por ano_obra - contar quantidade e somar valores
    const obrasPorAnoMap: { [key: number]: { quantidade: number; valor: number } } = {};
    
    obras.forEach((obra) => {
      // Usar ano_obra se existir, senão usar o ano do created_at
      const ano = obra.ano_obra || new Date(obra.created_at || new Date()).getFullYear();
      const valor = Number(obra.valor_total) || 0;
      
      if (!obrasPorAnoMap[ano]) {
        obrasPorAnoMap[ano] = { quantidade: 0, valor: 0 };
      }
      obrasPorAnoMap[ano].quantidade += 1;
      obrasPorAnoMap[ano].valor += valor;
    });

    // Filtrar apenas anos com mais de 5 obras
    const anosValidos = Object.keys(obrasPorAnoMap)
      .map(Number)
      .filter(ano => obrasPorAnoMap[ano].quantidade > 5)
      .sort((a, b) => a - b);

    // Se não houver anos válidos, retornar array vazio
    if (anosValidos.length === 0) {
      return [];
    }

    // Calcular projeção como média dos 3 últimos anos válidos
    const ultimosTresAnos = anosValidos.slice(-3).map(ano => obrasPorAnoMap[ano].valor);
    const mediaProjecao = ultimosTresAnos.length > 0 
      ? ultimosTresAnos.reduce((a, b) => a + b, 0) / ultimosTresAnos.length
      : 0;

    // Montar dados do gráfico: histórico + 1 projeção
    const dados = anosValidos.map(ano => ({
      ano,
      valor: obrasPorAnoMap[ano].valor,
      isProjecao: false
    }));

    // Adicionar projeção para o próximo ano após o último ano válido
    const proximoAnoProjecao = Math.max(...anosValidos) + 1;
    dados.push({
      ano: proximoAnoProjecao,
      valor: Math.round(mediaProjecao),
      isProjecao: true
    });

    return dados;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Card 1: FATURAMENTO x FASE */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E1E1E] px-6 py-4">
          <h3 className="text-base font-bold text-[#F5C800] uppercase tracking-wide">Faturamento x Fase</h3>
        </div>
        <div className="p-6 bg-white flex flex-col items-center justify-center" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={faturamentoPorStatusOrdenado} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 0 }} />
              <YAxis tick={{ fontSize: 12, fill: '#666' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(224, 187, 20, 0.1)' }} />
              <Bar dataKey="value" name="Valor" radius={[6, 6, 0, 0]} label={{ position: 'top', formatter: (value: number) => formatCurrency(value), fontSize: 12, fontWeight: 'bold', fill: '#1E1E1E' }}>
                {faturamentoPorStatusOrdenado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.name)} />
                ))}
              </Bar>
              <Legend 
                wrapperStyle={{ display: 'flex', justifyContent: 'center' }}
                payload={faturamentoPorStatusOrdenado.map((entry) => ({
                  value: entry.name,
                  type: 'circle',
                  color: getBarColor(entry.name)
                }))}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 2: OBRAS x FASE */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E1E1E] px-6 py-4">
          <h3 className="text-base font-bold text-[#F5C800] uppercase tracking-wide">Obras x Fase</h3>
        </div>
        <div className="p-6 bg-white flex flex-col items-center justify-center" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={obrasPorStatusOrdenado}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: { value: number }) => entry.value}
                outerRadius={90}
                dataKey="value"
              >
                {obrasPorStatusOrdenado.map((entry, index) => (
                  <Cell key={`pie-${index}`} fill={getPieColors()[index]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipPie />} />
              <Legend 
                wrapperStyle={{ paddingTop: '40px', display: 'flex', justifyContent: 'center' }}
                payload={obrasPorStatusOrdenado.map((entry, index) => ({
                  value: entry.name,
                  type: 'circle',
                  color: getPieColors()[index]
                }))}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 3: FATURAMENTO x ANO (COM PROJEÇÃO) */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E1E1E] px-6 py-4">
          <h3 className="text-base font-bold text-[#F5C800] uppercase tracking-wide">Faturamento x Ano (Projeção)</h3>
        </div>
        <div className="p-6 bg-white" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={gerarDadosComProjecao()} margin={{ top: 10, right: 20, left: 60, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="ano" tick={{ fontSize: 12, fill: '#666' }} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: '#1E1E1E', 
                  border: '2px solid #F5C800', 
                  borderRadius: '6px',
                  color: '#F5C800',
                  padding: '8px 12px',
                  fontSize: '13px'
                }}
                labelStyle={{ color: '#F5C800', fontWeight: 'bold' }}
                cursor={{ stroke: '#F5C800', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke={COLORS.yellow}
                strokeWidth={3}
                dot={{
                  fill: COLORS.yellow,
                  r: 5,
                  strokeWidth: 1,
                  stroke: '#1E1E1E',
                }}
                activeDot={{ r: 7 }}
                label={{ position: 'top', formatter: (value: number) => formatCurrency(value), fontSize: 13, fontWeight: 'bold', fill: '#1E1E1E' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card 4: OBRA x ANO */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#1E1E1E] px-6 py-4">
          <h3 className="text-base font-bold text-[#F5C800] uppercase tracking-wide">Obra x Ano</h3>
        </div>
        <div className="p-6 bg-white" style={{ height: '360px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={obrasPorAno} margin={{ top: 10, right: 20, left: 60, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="ano" tick={{ fontSize: 12, fill: '#666' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1E1E1E', 
                  border: '2px solid #F5C800', 
                  borderRadius: '6px',
                  color: '#F5C800',
                  padding: '8px 12px',
                  fontSize: '13px'
                }}
                cursor={{ stroke: '#F5C800', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="quantidade" 
                stroke={COLORS.yellow}
                strokeWidth={3}
                dot={{ fill: COLORS.yellow, r: 5, strokeWidth: 1, stroke: '#1E1E1E' }}
                activeDot={{ r: 7 }}
                label={{ position: 'top', fontSize: 13, fontWeight: 'bold', fill: '#1E1E1E' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
