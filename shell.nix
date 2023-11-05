{ pkgs ? import (fetchTarball "https://channels.nixos.org/nixos-unstable/nixexprs.tar.xz") { } }:
pkgs.mkShell {
  buildInputs = with pkgs;
    [
      bun
    ];
}
