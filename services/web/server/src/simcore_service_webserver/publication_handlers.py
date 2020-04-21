import json
import os

from aiohttp import MultipartReader, hdrs, web

from .login.decorators import RQT_USEREMAIL_KEY, login_required

support_email_address = 'support@osparc.io'
email_template_name = 'service_submission.html'

@login_required
async def service_submission(request: web.Request):
    reader = MultipartReader.from_response(request)
    data = None
    filedata = None
    # Read multipart email
    while True:
        part = await reader.next()
        if part is None:
            break
        if part.headers[hdrs.CONTENT_TYPE] == 'application/json':
            data = await part.json()
            continue
        if part.headers[hdrs.CONTENT_TYPE] == 'application/zip':
            filedata = await part.read(decode=True)
            # Validate max file size
            maxsize = 10 * 1024 * 1024 # 10MB
            actualsize = len(filedata)
            if actualsize > maxsize:
                raise web.HTTPRequestEntityTooLarge(maxsize, actualsize)
            filename = part.filename
            continue
        raise web.HTTPUnsupportedMediaType(reason=f'One part had an unexpected type: {part.headers[hdrs.CONTENT_TYPE]}')
    # data (dict) and file (bytearray) have the necessary information to compose the email
    user_email = request.get(RQT_USEREMAIL_KEY, -1)
    try:
        # send email
        from .login.utils import (render_and_send_mail, common_themed)
        from json2html import json2html
        subject = 'New service submission'
        is_real_usage = any([env in os.environ.get("SWARM_STACK_NAME") for env in ('production', 'staging')])
        await render_and_send_mail(
            request,
            support_email_address if is_real_usage else user_email,
            common_themed(email_template_name),
            {
                'user': user_email,
                'data': json2html.convert(json=json.dumps(data), table_attributes='class="pure-table"'),
                'subject': subject if is_real_usage else 'TEST: ' + subject
            },
            [(filename, filedata)] if filedata else None
        )
    except Exception:
        raise web.HTTPServiceUnavailable()

    return True
