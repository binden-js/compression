#!/bin/bash

# Pass the passphrase to gpg
gpg --batch --pinentry-mode=loopback --passphrase ${PGP_PASSPHRASE} -v $@
