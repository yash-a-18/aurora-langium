FROM gitpod/openvscode-server:latest

ENV OPENVSCODE_SERVER_ROOT=/home/.openvscode-server
ENV OPENVSCODE="${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server"

COPY --chown=openvscode-server:openvscode-server aurora-langium-*.vsix /tmp/aurora-langium.vsix
COPY --chown=openvscode-server:openvscode-server Examples/ /opt/aurora-examples/
COPY --chown=openvscode-server:openvscode-server Examples/ /home/workspace/Examples/

RUN ${OPENVSCODE} --install-extension /tmp/aurora-langium.vsix \
    && rm /tmp/aurora-langium.vsix
