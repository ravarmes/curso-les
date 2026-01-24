## Diagnóstico do Projeto
- O “site” é um export do Visio/Word: a página principal é [PDS_01.htm](file:///c:/GitHub/curso-les/PDS_01.htm) e ela carrega tudo dentro de [PDS_01_arquivos/](file:///c:/GitHub/curso-les/PDS_01_arquivos/).
- Os anexos (Word/Excel/Astah/Pod/JSON) já estão na pasta e os links nos HTMLs do Word são majoritariamente relativos (bom para GitHub Pages).
- Há referências antigas `file://H:\...` em [data.xml](file:///c:/GitHub/curso-les/PDS_01_arquivos/data.xml), mas os hyperlinks do diagrama também possuem `Address` relativo, então dá para garantir que, publicado, ele use sempre o relativo.

## Publicação no GitHub Pages
- Criar um [index.html] na raiz apontando para `PDS_01.htm` (redirect automático ou link de entrada), porque o Pages procura `index.html` por padrão.
- Garantir que `PDS_01.htm` e a pasta `PDS_01_arquivos/` (incluindo subpastas e anexos `.doc/.xlsx/...`) estejam versionados e publicados.
- (Opcional, recomendado) Adicionar `.nojekyll` para evitar qualquer processamento do Jekyll e servir tudo “as-is”.

## Correção/Padronização dos Links de Anexos
- Fazer uma varredura em todos os `*.htm/*.html` para:
  - Remover/evitar qualquer `file://` (ou caminho de Windows) que ainda esteja sendo usado em hyperlinks.
  - Confirmar que todos os anexos referenciados existem com o mesmo nome (case-sensitive no Pages).
- Padronizar links para anexos (Word/Excel/etc.) para abrir em nova aba, sem tirar o usuário da leitura:
  - Adicionar `target="_blank"` + `rel="noopener"` nos links de anexos.
  - (Opcional) Adicionar `download` quando fizer sentido.
- Endurecer a resolução de hyperlinks do Visio em [PDS_01.htm](file:///c:/GitHub/curso-les/PDS_01.htm): ajustar a função `CreateHLObj` para sempre preferir `HLURL:Address` quando `HLURL:AbsoluteURL` começar com `file://` (garante funcionamento no Pages mesmo se algum shape estiver “mal exportado”).

## Melhoria Visual (Anexo 1 e 2)
- Remover a barra lateral sem quebrar o viewer:
  - Manter o frame `frmToolbar` carregando (para não quebrar JS), mas deixar invisível definindo o `frameset` como `cols="0,*"` e removendo bordas/espaçamentos.
- Ajustar pequenos detalhes de layout (margens/scroll) para aproveitar melhor a largura e deixar a visualização mais limpa.

## Validação
- Testar localmente em um servidor estático e simular a navegação real:
  - Abrir `index.html` → redireciona para `PDS_01.htm`.
  - Clicar nas fases (Anexo 1/2) e nas atividades.
  - Clicar em links de anexos e confirmar que fazem download/abrem corretamente.
- Checar no Pages após publicar (URLs em subpasta `/repo/`) para garantir que nenhum link depende de caminho raiz `/`.
