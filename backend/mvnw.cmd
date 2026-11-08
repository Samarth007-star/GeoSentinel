@ECHO OFF
IF "%JAVA_HOME%"=="" (
    IF EXIST "C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot\bin\java.exe" (
        SET "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.13.9-hotspot"
    ) ELSE IF EXIST "C:\Program Files\Java\jdk-21\bin\java.exe" (
        SET "JAVA_HOME=C:\Program Files\Java\jdk-21"
    ) ELSE (
        SET "JAVA_HOME=C:\Program Files\Java\jdk-26"
    )
)
"C:\Users\Abhi\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd" %*
