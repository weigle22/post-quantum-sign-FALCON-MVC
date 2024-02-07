IF NOT EXISTS (SELECT 1 FROM dbo.[User])
BEGIN
	INSERT INTO dbo.[User] (FistName, LastName)
	VALUES ('Emman', 'Weigle'), 
	('John', 'Mayer'),
	('Sue', 'Storm'),
	('Mary', 'Jones');
END
