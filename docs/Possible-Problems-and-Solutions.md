# Testing different Environments (Sites)

## Shell scripts don't execute and show options instead

### Problem

When executing the shell scripts to run the tests it just shows this output:

```shell
docker-compose run --no-deps SERVICE COMMAND [ARGS...]
Usage:
  run [options] [-v VOLUME...] [-p PORT...] [-e KEY=VAL...] [-l KEY=VALUE...] [--]
    SERVICE [COMMAND] [ARGS...]
Options:
  -d, --detach     Detached mode: Run container in the background, print
             new container name.
  --name NAME      Assign a name to the container
  --entrypoint CMD   Override the entrypoint of the image.
  -e KEY=VAL      Set an environment variable (can be used multiple times)
  -l, --label KEY=VAL  Add or override a label (can be used multiple times)
  -u, --user=“”     Run as specified username or uid
  --no-deps       Don’t start linked services.
  --rm         Remove container after run. Ignored in detached mode.
  -p, --publish=[]   Publish a container’s port(s) to the host
  --service-ports    Run command with the service’s ports enabled and mapped
             to the host.
  --use-aliases     Use the service’s network aliases in the network(s) the
             container connects to.
  -v, --volume=[]    Bind mount a volume (default [])
  -T          Disable pseudo-tty allocation. By default `docker-compose run`
             allocates a TTY.
  -w, --workdir=“”
```

### Solution

If you get just this output from running the shell scripts then it is very likely that you are using an oudated version missing one of the options used in the generated command.

For example, the `-i` option is missing in older Docker versions. Try upgrading your Docker or Orbstack to solve the problem.
