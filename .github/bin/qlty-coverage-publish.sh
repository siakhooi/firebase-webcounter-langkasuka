#!/bin/bash

set -ex
curl https://qlty.sh | bash

export PATH="$HOME/.qlty/bin:$PATH"

qlty coverage publish functions/coverage/lcov.info \
--add-prefix functions
