#!/bin/bash
# usage: runep.sh idf epw outdir
EP=/tmp/eplus_dl/EnergyPlus-23.2.0-7636e6b3e9-Linux-Ubuntu22.04-x86_64
mkdir -p "$3" && cd "$3" && $EP/energyplus -w "$2" -d "$3" -r "$1" > run.log 2>&1; tail -3 run.log; grep -c "\*\* Severe" eplusout.err; grep -c "\*\*  Fatal" eplusout.err
