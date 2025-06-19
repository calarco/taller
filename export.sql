COPY (SELECT
    	id AS "clientId.string()",
		nombre AS "name.string()",
		apellido AS "lastName.string()",
    	telefono AS "phone.string()",
    	dni AS "dni.string()",
    	email AS "email.string()",
    	empresa AS "work.string()",
    	"createdAt" AS "createdAt.auto()",
    	"updatedAt" AS "updatedAt.auto()"
	FROM
    	clientes
) TO '/tmp/clients.tsv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER E'\t');

COPY (SELECT
    	id AS "carMakeId.string()",
		nombre AS "name.string()",
    	"createdAt" AS "createdAt.auto()",
    	"updatedAt" AS "updatedAt.auto()"
	FROM
    	fabricantes
) TO '/tmp/carMakes.tsv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER E'\t');

COPY (SELECT
    	id AS "carModelId.string()",
		nombre AS "name.string()",
		"fabricanteId" AS "carMakeId.string()",
    	"createdAt" AS "createdAt.auto()",
    	"updatedAt" AS "updatedAt.auto()"
	FROM
    	modelos
) TO '/tmp/carModels.tsv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER E'\t');

COPY (SELECT
    	patente AS "vehicleId.string()",
		year AS "year.int32()",
		combustible AS "fuel.string()",
		cilindrada AS "displacement.int32()",
		vin AS "vin.string()",
		"modeloId" AS "carModelId.string()",
		"clienteId" AS "clientId.string()",
    	"createdAt" AS "createdAt.auto()",
    	"updatedAt" AS "updatedAt.auto()"
	FROM
    	vehiculos
) TO '/tmp/vehicles.tsv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER E'\t');

COPY (SELECT
    	reparaciones.id AS "repairId.string()",
		reparaciones.km AS "km.int32()",
		reparaciones.reparacion AS "description.string()",
		reparaciones.repuestos AS "detail.string()",
		reparaciones.costo AS "cost.int32()",
		reparaciones.labor AS "labor.int32()",
    	reparaciones."createdAt" AS "date.auto()",
		vehiculos.patente AS "vehicleId.string()",
    	reparaciones."createdAt" AS "createdAt.auto()",
    	reparaciones."updatedAt" AS "updatedAt.auto()"
	FROM
    	reparaciones
	JOIN
    	vehiculos
	ON
    	"vehiculoId"=vehiculos.id
) TO '/tmp/repairs.tsv' WITH (FORMAT CSV, HEADER TRUE, DELIMITER E'\t');
