let
  unstable = import <unstable> { config = { allowUnfree = true; }; };
in
{ pkgs ? import <nixpkgs> { } }:
pkgs.mkShell {
  buildInputs = with pkgs;
    [
      bun
    ];
}
