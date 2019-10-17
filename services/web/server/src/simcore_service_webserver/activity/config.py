""" projects activity's configuration

    - config-file schema
    - settings
"""
import trafaret as T

CONFIG_SECTION_NAME = "activity"

schema = T.Dict({
    T.Key("enabled", default=True, optional=True): T.Bool(),
    T.Key("prometheus_host", default='http://prometheus', optional=False): T.String(),
    T.Key("prometheus_port", default=9090, optional=False): T.Int(),
    T.Key("prometheus_api_version", default='v1', optional=False): T.String()
})
