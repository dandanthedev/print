FROM olbat/cupsd

RUN  cupsctl --share-printers --remote-any
RUN lpadmin -p printer -o printer-is-shared=true
RUN lpadmin -p EPSON_ET_2850_Series -o printer-is-shared=true