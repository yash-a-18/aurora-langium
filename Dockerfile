FROM gitpod/openvscode-server:latest

# envs to locate binary
ENV OPENVSCODE_SERVER_ROOT=/home/.openvscode-server
ENV OPENVSCODE="${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server"

# copying the extension vsix file to the image and setting proper ownership
COPY --chown=openvscode-server:openvscode-server aurora-langium-*.vsix /tmp/aurora-langium.vsix
# bake examples into the image (keep a copy outside workspace to avoid bind-mount hiding it)
COPY --chown=openvscode-server:openvscode-server Examples/ /opt/aurora-examples/
COPY --chown=openvscode-server:openvscode-server Examples/ /home/workspace/Examples/
# pre installing the extension
RUN ${OPENVSCODE} --install-extension /tmp/aurora-langium.vsix \
    && rm /tmp/aurora-langium.vsix
