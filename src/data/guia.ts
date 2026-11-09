/**
 * Conteúdo do Guia do Estudante.
 *
 * Fonte principal: documento informativo entregue pela equipe AfirmAção
 * (public/materiais/guia-do-estudante.pdf, original "Documento sem nome(2).PDF").
 * As informações foram comparadas com publicações sobre os programas em novembro de 2026.
 * Regras, valores e datas mudam a cada edição: o site sempre orienta a conferir o edital vigente.
 */

export const GUIA_REVISADO_EM = 'novembro de 2026'
export const GUIA_PDF = `${import.meta.env.BASE_URL}materiais/guia-do-estudante.pdf`

export interface LinkOficial {
  rotulo: string
  url: string
}

export const sisu = {
  requisitos: [
    'Ter realizado uma das três edições do ENEM consideradas pelo processo seletivo, conforme as regras vigentes em 2026.',
    'Não ter zerado a redação.',
    'Não ter participado do ENEM como treineiro.',
    'Cumprir eventuais notas mínimas exigidas pela instituição para o curso escolhido.',
  ],
  comoFunciona:
    'O estudante pode escolher até duas opções de curso e acompanhar sua classificação durante o período de inscrições.',
  observacao:
    'Na edição de 2026, o sistema passou a considerar automaticamente a melhor nota entre as três últimas edições do ENEM. Confira as edições aceitas no edital da edição em que você vai se inscrever.',
  link: { rotulo: 'Portal oficial do Sisu', url: 'https://acessounico.mec.gov.br/sisu' } as LinkOficial,
}

export const documentosMatricula = [
  { item: 'Documento oficial de identificação com foto', detalhe: 'RG ou outro documento aceito no edital' },
  { item: 'CPF' },
  { item: 'Certificado de conclusão do ensino médio', detalhe: 'ou documento equivalente' },
  { item: 'Histórico escolar do ensino médio' },
  { item: 'Certidão de nascimento ou casamento' },
  { item: 'Comprovante de residência' },
  { item: 'Título de eleitor e comprovante de regularidade eleitoral', detalhe: 'quando exigidos' },
  { item: 'Documento de situação militar', detalhe: 'quando aplicável e exigido' },
]

export const documentosCotas = [
  {
    modalidade: 'Escola pública',
    documentos: 'Histórico ou declaração que comprove ter cursado integralmente o ensino médio em escola pública.',
  },
  {
    modalidade: 'Baixa renda',
    documentos:
      'Contracheques, comprovantes de benefícios, declaração de renda ou outros documentos financeiros dos integrantes da família.',
  },
  {
    modalidade: 'Pessoas pretas e pardas',
    documentos: 'Autodeclaração e, quando prevista, participação em procedimento de heteroidentificação.',
  },
  {
    modalidade: 'Pessoas indígenas e quilombolas',
    documentos: 'Documentos de pertencimento ou declarações comunitárias previstas no edital.',
  },
  {
    modalidade: 'Pessoas com deficiência',
    documentos: 'Laudo ou documentação comprobatória e eventual avaliação por comissão.',
  },
]

export interface Programa {
  id: string
  sigla: string
  nome: string
  resumo: string
  valor?: string
  criterios: string[]
  documentos: string
  comoSolicitar?: string
  observacao?: { titulo: string; texto: string }
  links: LinkOficial[]
}

export const bolsasFinanciamento: Programa[] = [
  {
    id: 'prouni',
    sigla: 'ProUni',
    nome: 'Universidade para Todos',
    resumo:
      'Concede bolsas de estudo em instituições privadas. O estudante não precisa devolver o valor da bolsa.',
    criterios: [
      'Média de pelo menos 450 pontos no ENEM e nota superior a zero na redação, considerando uma das duas últimas edições válidas.',
      'Renda familiar bruta mensal por pessoa de até 1,5 salário mínimo para bolsa integral ou até 3 salários mínimos para bolsa de 50%.',
      'Não possuir diploma de ensino superior, ressalvadas as regras específicas aplicáveis.',
      'Cumprir os critérios de escolaridade e demais condições do programa. Pessoas com deficiência e professores da rede pública podem se enquadrar em hipóteses específicas.',
    ],
    documentos:
      'Identidade, CPF, comprovantes de renda familiar, documentos escolares e comprovantes da condição declarada, quando aplicável.',
    links: [{ rotulo: 'Portal oficial do ProUni', url: 'https://acessounico.mec.gov.br/prouni' }],
  },
  {
    id: 'fies',
    sigla: 'Fies',
    nome: 'Financiamento Estudantil',
    resumo:
      'Permite financiar mensalidades de cursos superiores em instituições privadas participantes. O valor financiado deverá ser pago conforme o contrato.',
    criterios: [
      'Ter realizado o ENEM a partir de 2010, sem ser treineiro.',
      'Média de pelo menos 450 pontos e redação superior a zero.',
      'Renda familiar bruta mensal de até 3 salários mínimos por pessoa.',
      'Atender aos critérios de contratação e comprovação documental.',
    ],
    documentos:
      'Identificação, CPF, comprovantes de residência e renda, dados do grupo familiar e documentos exigidos na validação e contratação.',
    observacao: {
      titulo: 'Fies Social',
      texto:
        'Modalidade voltada a estudantes inscritos no CadÚnico, com renda familiar por pessoa de até meio salário mínimo, observadas as regras do edital. Prevê reserva de vagas e possibilidade de financiamento de até 100% dos encargos educacionais, respeitados os limites do programa.',
    },
    links: [{ rotulo: 'Portal oficial do Fies', url: 'https://acessounico.mec.gov.br/fies' }],
  },
]

export const permanencia: Programa[] = [
  {
    id: 'pe-de-meia-licenciaturas',
    sigla: 'Pé-de-Meia Licenciaturas',
    nome: 'Incentivo para quem quer ser professor',
    resumo: 'Incentivo financeiro a estudantes de licenciatura.',
    valor:
      'R$ 1.050 mensais: R$ 700 disponíveis para saque e R$ 350 depositados em uma poupança, que poderá ser resgatada após a conclusão do curso, desde que o estudante ingresse como professor da rede pública de ensino em até cinco anos.',
    criterios: [
      'Média igual ou superior a 650 pontos no ENEM.',
      'Ingresso em licenciatura presencial pelo Sisu, ProUni ou Fies.',
      'Cumprir os requisitos de matrícula, desempenho acadêmico e seleção do programa.',
    ],
    documentos:
      'Conta gov.br para acessar a Plataforma Freire e os dados pedidos na pré-inscrição. A validação da matrícula é acompanhada pela própria plataforma.',
    comoSolicitar:
      'Faça a pré-inscrição na Plataforma Freire, da Capes, utilizando sua conta gov.br, e acompanhe a validação da sua matrícula e os resultados da seleção. O cadastro não garante a bolsa: a concessão segue o edital.',
    links: [{ rotulo: 'Plataforma Freire (Capes)', url: 'https://freire.capes.gov.br/' }],
  },
  {
    id: 'pnaes',
    sigla: 'PNAES',
    nome: 'Política Nacional de Assistência Estudantil',
    resumo:
      'Instituída pela Lei nº 14.914/2024, busca garantir a permanência de estudantes no ensino superior público federal, especialmente daqueles em situação de vulnerabilidade socioeconômica.',
    criterios: [
      'Atender aos critérios socioeconômicos e acadêmicos estabelecidos pela instituição.',
      'Há prioridade para estudantes em situação de vulnerabilidade.',
    ],
    documentos:
      'Geralmente são exigidos RG, CPF, comprovantes de matrícula, residência, renda familiar e composição do grupo familiar.',
    comoSolicitar:
      'Consulte os editais de assistência estudantil da sua universidade, que estabelecem os benefícios disponíveis, os requisitos e os prazos de inscrição.',
    links: [
      {
        rotulo: 'Lei nº 14.914/2024 (Planalto)',
        url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14914.htm',
      },
    ],
  },
  {
    id: 'bolsa-permanencia',
    sigla: 'Bolsa Permanência',
    nome: 'Programa Bolsa Permanência (PBP/MEC)',
    resumo: 'Benefício destinado a contribuir com as despesas durante a graduação.',
    valor: 'R$ 1.400 mensais.',
    criterios: [
      'Estudantes indígenas ou quilombolas matriculados em cursos presenciais de graduação em instituições federais.',
      'Comprovar o pertencimento étnico e atender aos requisitos do programa.',
    ],
    documentos:
      'Documento de identificação, comprovante de matrícula, declaração de pertencimento étnico e documentação complementar exigida pelo programa.',
    comoSolicitar:
      'Acompanhe os editais e orientações da instituição federal em que você está matriculado e faça a inscrição conforme os procedimentos estabelecidos pelo MEC.',
    links: [
      {
        rotulo: 'Portal oficial do Programa Bolsa Permanência',
        url: 'https://www.gov.br/pt-br/servicos/obter-bolsa-do-programa-de-bolsa-permanencia',
      },
    ],
  },
]
