#!/bin/bash
# http://redsymbol.net/articles/unofficial-bash-strict-mode/
set -o errexit   # abort on nonzero exitstatus
set -o nounset   # abort on unbound variable
set -o pipefail  # don't hide errors within pipes
IFS=$'\n\t'

FOLDER_CHECKS=(js eslintrc json .travis.yml)

before_install() {
    if bash ci/travis/helpers/test-for-changes.bash "${FOLDER_CHECKS[@]}";
    then
        bash ci/helpers/show_system_versions.bash
    fi
}

install() {
    if bash ci/travis/helpers/test-for-changes.bash "${FOLDER_CHECKS[@]}";
    then
        npm install
        make -C services/web/client clean
    fi
}

before_script() {
    if bash ci/travis/helpers/test-for-changes.bash "${FOLDER_CHECKS[@]}";
    then
        npx eslint --version
        make -C services/web/client info
    fi
}

script() {
    if bash ci/travis/helpers/test-for-changes.bash "${FOLDER_CHECKS[@]}";
    then
        echo "# Running Linter"
        npm run linter

        pushd services/web/client

        echo "# Building build version"
        make compile

        echo "# Building source version"
        make compile-dev flags=--machine-readable

        echo "# Serving source version"
        make serve-dev flags="--machine-readable --target=source --listen-port=8080" detached=test-server

        #TODO: move this inside qx-kit container
        echo "# Waiting for build to complete"
        while ! nc -z localhost 8080; do
          sleep 1 # wait for 10 second before check again
        done

        # FIXME: reports ERROR ReferenceError: URL is not defined. See https://github.com/ITISFoundation/osparc-simcore/issues/1071
        ## node source-output/resource/qxl/testtapper/run.js --diag --verbose http://localhost:8080/testtapper
        wget --spider http://localhost:8080/

        make clean
        popd
    else
        echo "No changes detected. Skipping linting of node.js."
    fi
}

after_success() {
    # prepare documentation site ...
    git clone --depth 1 https://github.com/ITISFoundation/itisfoundation.github.io.git
    rm -rf itisfoundation.github.io/.git

    # if we have old cruft hanging around, we should remove all this will
    # only trigger once
    if [ -d itisfoundation.github.io/transpiled ]; then
      rm -rf itisfoundation.github.io/*
    fi

    # add the default homepage
    cp -rp docs/webdocroot/* itisfoundation.github.io

    # add our build
    if [ -d services/web/client/build-output ]; then
      rm -rf itisfoundation.github.io/frontend
      cp -rp services/web/client/build-output itisfoundation.github.io/frontend
    fi
}

after_failure() {
    make -C services/web/client clean
    echo "failure... you can always write something more interesting here..."
}

# Check if the function exists (bash specific)
if declare -f "$1" > /dev/null
then
  # call arguments verbatim
  "$@"
else
  # Show a helpful error
  echo "'$1' is not a known function name" >&2
  exit 1
fi
