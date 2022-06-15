FROM ethereum/client-go:alltools-stable

ARG password=password

WORKDIR /geth

COPY genesis.json . 
RUN geth init --datadir data genesis.json 

COPY keystore data/keystore
COPY --chown=777 start.sh .

RUN echo ${password} > password

CMD ["./start.sh"]