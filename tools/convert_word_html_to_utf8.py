from __future__ import annotations

from pathlib import Path


FILES = [
    Path("PDS_01_arquivos/IFES-LES-Doc-PDS-Concepcao.htm"),
    Path("PDS_01_arquivos/IFES-LES-Doc-PDS-Construcao.html"),
    Path("PDS_01_arquivos/IFES-LES-Doc-PDS-ElaboracaoI.html"),
    Path("PDS_01_arquivos/IFES-LES-Doc-PDS-ElaboracaoII.html"),
    Path("PDS_01_arquivos/IFES-LES-Doc-PDS-Transicao.html"),
]


def convert_file(path: Path) -> None:
    data = path.read_bytes()
    text = data.decode("cp1252")

    text = text.replace(
        '<meta http-equiv=Content-Type content="text/html; charset=windows-1252">',
        '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">',
    )

    path.write_bytes(text.encode("utf-8"))


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    for rel in FILES:
        path = (repo_root / rel).resolve()
        if not path.exists():
            raise FileNotFoundError(str(rel))
        convert_file(path)


if __name__ == "__main__":
    main()

