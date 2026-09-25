@ECHO OFF
IF "%JAVA_HOME%"=="" SET JAVA_HOME=C:\Program Files\Java\jdk-26
"C:\Users\Abhi\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd" %*
