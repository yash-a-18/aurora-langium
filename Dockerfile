FROM gitpod/openvscode-server:latest

# envs for OpenVSCode Server
ENV OPENVSCODE_SERVER_ROOT=/home/.openvscode-server

# copying extension vsix file into the image
COPY --chown=openvscode-server:openvscode-server aurora-langium-*.vsix /extension.vsix

# put example projects into the image
COPY --chown=openvscode-server:openvscode-server Examples/ /home/workspace/Examples/

# reinstall the extensions on container start
ENTRYPOINT ["/bin/sh", "-c", "exec ${OPENVSCODE_SERVER_ROOT}/bin/openvscode-server \
  --host 0.0.0.0 \
  --port 3000 \
  --without-connection-token \
  --install-extension /extension.vsix \
  --start-server \
  \"$@\" \
  ", "--"]
