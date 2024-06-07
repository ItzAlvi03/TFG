createTablesSql = """CREATE TABLE "Clientes" (
	"ClienteID"	INTEGER NOT NULL,
	"Nombre"	TEXT NOT NULL UNIQUE,
	"Email"	TEXT NOT NULL UNIQUE,
	"CIF"	TEXT NOT NULL UNIQUE,
	"Direccion"	TEXT NOT NULL,
	"Tipo"	TEXT NOT NULL,
	"Num_Cuenta_Bancaria"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("ClienteID" AUTOINCREMENT)
    );

    CREATE TABLE "Pedidos" (
	"PedidoID"	INTEGER,
	"ClienteID"	INTEGER NOT NULL,
	"Estado"	TEXT NOT NULL,
	"Fecha"	TEXT NOT NULL,
	PRIMARY KEY("PedidoID" AUTOINCREMENT),
	FOREIGN KEY("ClienteID") REFERENCES "Clientes"("ClienteID")
    );

    CREATE TABLE "Facturas" (
	"FacturaID"	INTEGER,
	"PedidoID"	INTEGER NOT NULL,
	"Total"	REAL NOT NULL,
	"Fecha"	TEXT NOT NULL,
	PRIMARY KEY("FacturaID" AUTOINCREMENT),
	FOREIGN KEY("PedidoID") REFERENCES "Pedidos"("PedidoID")
    );

    CREATE TABLE "Productos" (
	"ProductoID"	INTEGER,
	"Nombre"	TEXT NOT NULL,
	"Embalaje"	TEXT NOT NULL,
	"Consumidor"	TEXT NOT NULL,
	"Precio"	REAL NOT NULL,
	PRIMARY KEY("ProductoID" AUTOINCREMENT)
    );

    CREATE TABLE "DetallesPedidos" (
	"DetalleID"	INTEGER,
	"PedidoID"	INTEGER NOT NULL,
	"ProductoID"	INTEGER NOT NULL,
	"Cantidad"	INTEGER NOT NULL,
	FOREIGN KEY("ProductoID") REFERENCES "Productos"("ProductoID"),
	PRIMARY KEY("DetalleID" AUTOINCREMENT)
    );

    CREATE TABLE "Rebajas" (
	"RebajaID"	INTEGER,
	"ClienteID"	INTEGER NOT NULL,
	"ProductoID"	INTEGER NOT NULL,
	"Descuento"	REAL NOT NULL,
	FOREIGN KEY("ProductoID") REFERENCES "Productos"("ProductoID"),
	FOREIGN KEY("ClienteID") REFERENCES "Clientes"("ClienteID"),
	PRIMARY KEY("RebajaID" AUTOINCREMENT)
    );"""