FROM python:3.12-slim
ARG DEBIAN_FRONTEND=noninteractive

# NodeJS + NPM
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs npm \
    && npm install -g pm2 \
    && rm -rf /var/lib/apt/lists/*

# VERIFY PYTHON INSTALLATION
RUN python --version

# intsall PM2 globally
RUN npm install -g pm2
# Verify NodeJS and NPM installation
RUN node --version
RUN npm --version

# Rust via rustup
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential \
    && curl https://sh.rustup.rs -sSf | sh -s -- -y \
    && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.cargo/bin:$PATH"
RUN rustc --version


# Upgrade pip, setuptools, wheel
RUN pip install --upgrade pip setuptools wheel

# Set working directory
WORKDIR /root/mod

# Copy application
COPY . .

# Install Python package in editable mode
RUN pip install -e ./

# Keep container alive
CMD ["tail", "-f", "/dev/null"]
